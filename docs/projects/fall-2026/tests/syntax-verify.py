"""Compile actual bank answers as C17; check behavior with independent expectations.

Only correct answers are executed. Distractors may intentionally contain UB.
Uses the system C compiler and temporary files; no third-party dependencies.
"""
import json
import os
import subprocess
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
bank = json.loads((root / "data/2122-syntax.json").read_text())
questions = {q["id"]: q for q in bank["questions"]}
used = set()


def answer(id):
    used.add(id)
    q = questions[id]
    return q["options"][q["correct"]]


blocks = []


def check(id, before="", after=""):
    blocks.append("{\n" + before + "\n" + answer(id) + "\n" + after + "\n}")


def expression(id, before, expected):
    blocks.append("{\n" + before + "\nCHECK((" + answer(id) + ") == (" + expected + "));\n}")


check("declarations-01", after="CHECK(count == 0);")
check("declarations-04", after="CHECK(x == 0 && y == 0);")
check("declarations-06", "int x=3, y=4;", "p=&x; q=&y; CHECK(*p+*q==7);")
check("declarations-07", "int x=3;", "p=&x; value=5; CHECK(*p+value==8);")
for id, expected in [("literals-01","42"),("literals-02","12"),("literals-03","1"),("literals-04","65"),("literals-06","0")]:
    expression(id,"",expected)
blocks.append("{ CHECK(strlen(" + answer("literals-08") + r''') == 1); CHECK((''' + answer("literals-08") + r''')[0] == '\\'); }''')
for id, before, result in [
    ("arithmetic-01","int x=0;","x==7"),("arithmetic-02","int x=5;","x==8"),
    ("arithmetic-03","int x=5;","x==3"),("arithmetic-04","int x=5;","x==20"),
    ("arithmetic-05","int x=5;","x==2"),("arithmetic-07","int count=5;","count==6")]:
    check(id,before,"CHECK("+result+");")
expression("arithmetic-08","int i=4;","4")
expression("arithmetic-09","int i=4;","5")
expression("logic-07","int x=5;","1")
expression("logic-08","int *p=NULL;","0")
expression("logic-09","int a=6,b=0;","0")
expression("logic-10","int flag=0,x=3,y=4;","4")
expression("grouping-01","int a=2,b=3,c=4;","20")
expression("grouping-02","unsigned x=0x80u,m=0x80u;","1")
check("grouping-03","int x=4; int *p=&x;", "CHECK(x==5 && p==&x);")  # expression as a statement
blocks[-1] = blocks[-1].replace(answer("grouping-03")+"\n",answer("grouping-03")+";\n")
check("conditions-02","int ok=1;", "CHECK(yes_count==1 && no_count==0);")
check("loops-07",'const char *s="abc"; size_t count=0;', "{ ++count; } CHECK(count==3);")
check("loops-08","size_t n=3; int a[]={1,2,3};", "CHECK(visit_count==3 && visited[0]==3 && visited[2]==1);")
check("addresses-01","int x=7;","CHECK(*p==7);")
check("addresses-03","int x=0; int *p=&x;","CHECK(x==7);")
check("addresses-04","int x=0,y=7; int *p=&x;","CHECK(p==&y && x==0);")
check("addresses-06","int x=0,y=7; int *p=&x,*q=&y;","CHECK(x==7 && p==&x && q==&y);")
check("pointer-moves-01","int a[]={2,5}; int *p=a;","CHECK(p==a+1);")
check("pointer-moves-02","int a[]={2,5}; int *p=a;","CHECK(a[0]==3 && p==a);")
expression("pointer-moves-03","int a[]={2,5}; int *p=a;","2")
expression("pointer-moves-06","int a[5]; int *p=a,*q=a+4;","4")
check("double-pointers-02","int x=7; int *p=&x;","CHECK(**pp==7);")
check("double-pointers-04","int x=7,y=2; int *p=&y,**pp=&p;","CHECK(p==&x && y==2);")
check("double-pointers-05","int x=0; int *p=&x,**pp=&p;","CHECK(x==9);")
check("double-pointers-07","int a[2]; int *p=a,**pp=&p;","CHECK(p==a+1);")
check("const-02","int x=1;","*p=7; CHECK(x==7);")
check("const-03","int x=7;","CHECK(*p==7);")
check("const-04","int x=0,y=7; const int *p=&x;","CHECK(*p==7);")
check("const-05","int x=0; int *const p=&x;","CHECK(x==5);")
check("arrays-02",after="CHECK(sizeof a / sizeof a[0] == 3 && a[2]==6);")
check("arrays-03",after="for(size_t i=0;i<5;i++) CHECK(a[i]==0);")
check("arrays-05","int a[3]={0};","CHECK(a[2]==7);")
check("arrays-06","int a[]={7};","CHECK(p==&a[0]);")
check("arrays-10","int a[3]={1,2,3};","p=&a; CHECK((*p)[2]==3);")
expression("sizeof-03","int a[7];","7")
expression("sizeof-07",'char buffer[32]="hi";',"32")
check("strings-01",after="s[0]='b'; CHECK(strcmp(s,\"bat\")==0);")
check("strings-02",'char buffer[10]="abcdef"; size_t n=3;',"CHECK(strlen(buffer)==3);")
check("strings-06",after="CHECK(strlen(s)==0 && sizeof s==4);")
check("strings-07",'char s[]="abc";',"CHECK(strcmp(s,\"aXc\")==0);")
expression("strings-09","char ch='7';","7")
expression("strings-10","int digit=7;","'7'")

# Test the exact formatting/conversion fragments against matching destination types.
printf_cases = [
 ("int x=42;","42"),("unsigned flags=42;","42"),("unsigned flags=42;","2a"),
 ("size_t count=42;","42"),('const char *s="a%b";',"a%b"),("char ch='X';","X"),
 ("double x=1.5;","1.500000"),("int value=1; void *p=&value;",None),
 ("","%"),("int x=42;","42\n"),("long long x=42;","42"),("int x=3,y=7;","3 7")]
for n,(before,result) in enumerate(printf_cases,1):
    code=answer(f"printf-{n:02}").replace("printf(", "snprintf(out, sizeof out, ",1)
    expected="CHECK(out[0]!=0);" if result is None else "CHECK(strcmp(out,"+json.dumps(result)+")==0);"
    blocks.append("{ char out[128]; "+before+code+expected+" }")

scanf_cases = [
 ("int x=0;","42","x==42"),("unsigned temp=0;","ff","temp==255"),
 ("unsigned count=0;","42","count==42"),("size_t count=0;","42","count==42"),
 ("float x=0;","1.5","x==1.5f"),("double x=0;","1.5","x==1.5"),
 ("char ch=0;"," \nX","ch=='X'"),("char word[16];","abcdefghijklmnop","strlen(word)==15"),
 ("int x=0;","42","x==42"),("int x=0,y=0;","3 7","x==3 && y==7"),
 ("unsigned char byte=0;","ff","byte==255"),("","42","1")]
for n,(before,data,expected) in enumerate(scanf_cases,1):
    code=answer(f"scanf-{n:02}").replace("scanf(", "sscanf("+json.dumps(data)+", ",1)
    if n in [9,10]:
        code="CHECK("+code+");"
    blocks.append("{ "+before+code+" CHECK("+expected+"); }")

check("input-06",'const char *text="42"; int x=0;', "CHECK(x==42);")
check("allocation-01","int *p=NULL;","CHECK(p!=NULL); *p=7; CHECK(*p==7); free(p);")
check("allocation-02","int *p=NULL; size_t n=4;","CHECK(p!=NULL); p[3]=7; CHECK(p[3]==7); free(p);")
check("allocation-03","int *p=NULL; size_t n=4;","CHECK(p!=NULL); for(size_t i=0;i<n;i++) CHECK(p[i]==0); free(p);")
check("allocation-09","int *p=malloc(sizeof *p); CHECK(p!=NULL); *p=7; size_t bytes=4*sizeof *p;", "CHECK(p!=NULL && p[0]==7); free(p);")
check("allocation-11",after="CHECK(1);")
expression("allocation-12","int *p; size_t n=SIZE_MAX;","0")
check("memory-01","unsigned char buffer[]={1,2,3}; size_t n=3;","CHECK(buffer[0]==0 && buffer[2]==0);")
check("memory-03","unsigned char dst[3],src[]={1,2,3}; size_t n=3;","CHECK(dst[0]==1 && dst[2]==3);")
check("memory-04","char a[]=\"abcd\"; char *src=a,*dst=a+1; size_t n=3;","CHECK(memcmp(a,\"aabc\",4)==0);")
expression("memory-05","char a[]=\"abc\",b[]=\"abc\"; size_t n=3;","1")
check("memory-06","int x=0; void *mem=&x;","CHECK((void *)p==mem);")
expression("string-library-01",'const char *s="abc";',"3")
expression("string-library-02",'char a[]="abc",b[]="abc";',"1")
check("string-library-03",'char dst[16]; const char *src="abc";',"CHECK(strcmp(dst,\"abc\")==0);")
check("string-library-04",'char dst[16]="ab"; const char *src="cd";',"CHECK(strcmp(dst,\"abcd\")==0);")
expression("string-library-05",'char s[]="abc"; int ch=\'b\';',"s+1")
expression("string-library-06",'char haystack[]="abcdef"; char needle[]="cd";',"haystack+2")
expression("string-library-07",'char a[]="abc",b[]="abd"; size_t n=2;',"0")
check("string-library-08",'char dst[16]; const char *src="abcdefghijklmnopqr"; strncpy(dst,src,sizeof dst-1);',"CHECK(strlen(dst)==15);")
for initial in ["abc\n","abc",""]:
    check("string-library-09","char buffer[16]="+json.dumps(initial)+";","CHECK(strcmp(buffer,"+json.dumps(initial.rstrip("\n"))+")==0);")
check("structs-06","struct Item item={0}; struct Item *p=&item;","CHECK(item.value==7);")
check("structs-08",after="CHECK(item.value==7);")
check("structs-09","struct Item a={0},b={7};","CHECK(a.value==7);")
check("typedefs-01",after="byte x=255; CHECK(x==255);")
check("typedefs-03",after="enum Color c=BLUE; CHECK(c==1);")
check("typedefs-04",after="CHECK(READY==3);")
check("typedefs-06","typedef int *IntPtr; int x=1,y=2;","p=&x; q=&y; CHECK(*p+*q==3);")
check("typedefs-08",after="CHECK(ready);")
check("nodes-02","struct Node b={2,NULL},a={1,&b}; struct Node *p=&a;","CHECK(p==&b);")
check("nodes-04","struct Node old={1,NULL},added={2,NULL}; struct Node *head=&old,*node=&added;","CHECK(node->next==head);")
check("nodes-06","struct Node n={1,NULL}; struct Node *head=NULL,**headp=&head,*node=&n;","CHECK(head==node);")
check("nodes-08","struct Node b={2,NULL}; struct Node *p=malloc(sizeof *p); CHECK(p!=NULL); p->next=&b;","CHECK(p==&b);")

# Exhaustive byte masks with all 32 bit positions; oracle uses division or
# arithmetic modification of the selected bit, not the answer's bitwise formula.
for k in range(32):
    for x in [0,1,0x55,0xAA,0xFF,0x80000000,0xFFFFFFFF]:
        for id,expected in [
            ("masks-01",1<<k),("masks-05",(x//(1<<k))%2),
            ("masks-06",int((x//(1<<k))%2!=0))]:
            expression(id,f"unsigned x={x}u; int k={k}; (void)x;",str(expected)+"u")
        old=(x//(1<<k))%2
        for id,result in [("masks-02",x+(1-old)*(1<<k)),("masks-03",x-old*(1<<k)),("masks-04",x+(1-2*old)*(1<<k))]:
            check(id,f"unsigned x={x}u; int k={k};","CHECK(x=="+str(result)+"u);")
for k in range(32):
    expression("masks-12",f"int k={k};",str(2**k-1)+"u")
for byte in range(256):
    for position in [0,1,7,8,15]:
        data=[byte,255-byte];msb=f"{data[position//8]:08b}"[position%8];lsb=f"{data[position//8]:08b}"[7-position%8]
        before=f"unsigned char data[]={{{data[0]},{data[1]}}}; size_t p={position};"
        expression("fields-06",before,lsb+"u")
        expression("fields-07",before,msb+"u")
expression("fields-08","size_t total=SIZE_MAX,pos=SIZE_MAX-2,width=3;","0")
expression("fields-08","size_t total=SIZE_MAX,pos=SIZE_MAX-2,width=2;","1")
for L in [1,8,16,31]:
    for signed in [-1,-(2**(L-1))]:
        expression("conversions-06",f"unsigned raw={2**L+signed}u; int L={L};",str(signed))
expression("conversions-02","int a=3,b=2;","1.5")
check("storage-build-01",after="CHECK(total==7);")

prefix = r"""
#include <stdio.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <limits.h>
#include <stdbool.h>
static unsigned checks=0;
#define CHECK(c) do { ++checks; if (!(c)) { fprintf(stderr,"failed line %d\n",__LINE__); exit(1); } } while(0)
int total=7, yes_count=0, no_count=0, visit_count=0, visited[3];
void yes(void){++yes_count;}
void no(void){++no_count;}
void use(int x){visited[visit_count++]=x;}
struct Item {int value;};
struct Node {int value; struct Node *next;};
"""
# Compile the actual function and stream forms even when they are not executed.
prefix += answer("functions-02") + "\n"
prefix += "void stream_form(void) {\n" + answer("input-05") + "\n}\n"
prefix += "int local_counter(void) {\n"+answer("storage-build-03")+"\nreturn ++count;\n}\n"
prefix += answer("headers-06")+"\n"+answer("headers-07")+"\n"+answer("headers-08")+"\n"
source = prefix+"\nint main(void){\nCHECK(CHAR_BIT==8 && UINT_MAX==4294967295u);\n"+"\n".join(blocks)
source += "\nCHECK(twice(3)==6); CHECK(local_counter()==1); CHECK(local_counter()==2);\nprintf(\"%u C assertions passed\\n\",checks); return 0;}\n"
with tempfile.TemporaryDirectory(prefix="syntax-c-") as tmp:
    c=Path(tmp)/"verify.c";binary=Path(tmp)/"verify";c.write_text(source)
    command=[os.environ.get("CC","cc"),"-std=c17","-Wall","-Wextra","-Werror","-pedantic","-fsanitize=undefined",str(c),"-o",str(binary)]
    subprocess.run(command,check=True)
    result=subprocess.run([str(binary)],capture_output=True,text=True,check=True)
    print(result.stdout.strip())
    print(f"{len(used)} bank answer forms compiled and checked.")
