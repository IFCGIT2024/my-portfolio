# Java Testing Practice

Learn to read a contract, choose an input, predict the result, and express that check in JUnit Jupiter.

## Run the examples

You need a **JDK 11 or newer**. A JDK includes both `java` and `javac`.

Open this folder in VS Code with its Java Extension Pack, or another Java IDE. The Maven project declares JUnit Jupiter 5.10.5. Run `TrainingApiTest` from the Testing view.

With Maven installed, you can also run:

```sh
mvn test
```

The initial suite has **40 passing tests and one disabled writing placeholder**. The placeholder is explicitly disabled so it cannot be mistaken for a meaningful passing test. Replace its body and remove `@Disabled` when you begin.

### Terminal without Maven: macOS or Linux

From this folder:

```sh
bash run-tests.sh
```

The script downloads the JUnit Platform Console Standalone 1.10.5 jar from Maven Central into `.cache`, compiles `src`, and runs the tests. The console version contains Jupiter 5.10.5. It uses an installed `javac` and `java`.

The equivalent individual commands are:

```sh
mkdir -p .cache out
curl -fL https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-console-standalone/1.10.5/junit-platform-console-standalone-1.10.5.jar -o .cache/junit-console.jar
javac -cp .cache/junit-console.jar -d out src/main/java/practice/*.java src/test/java/practice/*.java
java -jar .cache/junit-console.jar execute -cp out --scan-classpath --details=tree
```

### Windows PowerShell

From this folder, use these commands (no shell policy changes required):

```powershell
New-Item -ItemType Directory -Force .cache, out | Out-Null
Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/junit/platform/junit-platform-console-standalone/1.10.5/junit-platform-console-standalone-1.10.5.jar' -OutFile '.cache/junit-console.jar'
$sources = Get-ChildItem -Path 'src/main/java/practice','src/test/java/practice' -Filter '*.java' | ForEach-Object FullName
javac -cp '.cache/junit-console.jar' -d out $sources
# Continue only if javac succeeded.
java -jar '.cache/junit-console.jar' execute -cp out --scan-classpath --details=tree
```

If `javac` is not found, configure your JDK's `bin` directory in PATH or use your IDE's configured JDK. A compiler error means the test has not run yet.

## A useful practice sequence

1. Open `TrainingApi.java` and read one method's comment before its body.
2. Write a case table: initial state, exact arguments, reason, expected observation.
3. Write one complete test in `YourPracticeTest.java`.
4. Run it. Identify whether any problem is compilation, a failed assertion, or an unexpected exception.
5. Explain which plausible defect your test would catch.
6. Add a different boundary or state transition. Avoid repeating the same effective case.

Use a fresh object in each test, or create one in `@BeforeEach`. Put valid setup outside `assertThrows`. Keep expected values independent from the implementation.

## Use the course's Counter examples here

`YourPracticeTest.java` already imports `practice.TrainingApi.Counter`, so the course's short name `Counter` works in that file. This Counter starts at zero and provides `get()`, `set(int)`, `increment()`, `isZero()`, and the static `requireNonnegative(int)` helper. A negative value is rejected with `IllegalArgumentException("value must be nonnegative")`; a rejected `set` leaves the previous count unchanged.

Paste a Counter test method inside `YourPracticeTest`, below the existing imports and inside its class braces. Keep the `package practice;` line. When copying only a method, do not paste another class declaration around it. The supplied imports cover `@Test` and assertions; add `org.junit.jupiter.api.BeforeEach` if your copied test uses that setup annotation.

Other lesson APIs such as `Numbers`, `Searches`, and `NameRules` are supplied hypothetical APIs for those exercises; they are not all implemented in this download. For additional runnable practice, use the documented methods in `TrainingApi.java`, adapting the call and its expected result to that method's own contract.

## Files

- `src/main/java/practice/TrainingApi.java`: contract-based example methods, a counter, and a fixed-capacity stack.
- `src/test/java/practice/TrainingApiTest.java`: complete examples of assertions, fixtures, boundaries, type-correct BigInteger arguments, exceptions, copies, and state sequences.
- `src/test/java/practice/YourPracticeTest.java`: your test-writing workspace.
- `src/main/java/practice/BrokenUtilities.java`: six deliberately faulty behaviours.
- `solutions/FaultFindingTest.java`: revealing tests; do not read until you have attempted the bugs.
- `solutions/EXPLANATIONS.md`: supported diagnoses and corrections.
- `defect-report.txt`: report template.

## Find defects

Read each contract in `BrokenUtilities.java`. For each method, supply one specific input/state that distinguishes the stated behaviour from the implementation. Write the test first. A revealing test should initially be unsuccessful.

Try these tasks without opening the solutions:

- Count positive elements: empty, singleton, and last-position cases.
- Find a String by text, including separately constructed equal Strings.
- Check an inclusive age threshold.
- Handle null and empty names according to the comment.
- Replace an existing count rather than only setting a fresh zero object.
- Remove a buffer's item and inspect every public observation affected by removal.

The model fault-finding tests are deliberately **outside** `src/test` so a normal initial run is green. To run them after your attempt, copy `solutions/FaultFindingTest.java` into `src/test/java/practice/`, then run the suite again. Expect six unsuccessful tests against the original faulty class: five assertion failures and one unexpected NullPointerException. Correct the production defects and rerun; keep the regression tests.

When a test fails, compare the contract, fixture, expected value, and actual value before blaming the production method. Do not change a correct expected value merely to make a test pass.

## Read a failure and write the report

Record the method, test name, exact setup, expected and actual observations, and the faulty expression. Separate an observed symptom from an inferred cause. After a change, record the actual rerun result; do not claim a proposed correction has been verified.

## References

- [JUnit 5.10.5 User Guide](https://docs.junit.org/5.10.5/user-guide/)
- [Java testing in VS Code](https://code.visualstudio.com/docs/java/java-testing)
- [Java exception tutorial](https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html)

The project uses ordinary Java and JUnit; the course page's writing boxes provide model-based review, while this project compiles and executes your tests.
