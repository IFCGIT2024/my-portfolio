"""
PDF Splitter Utility
Split a PDF file in half based on page count
"""

import sys
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
except ImportError:
    print("ERROR: pypdf library not found!")
    print("Install it with: pip install pypdf")
    sys.exit(1)


def split_pdf_in_half(input_pdf_path, output_dir=None):
    """
    Split a PDF file into two halves
    
    Args:
        input_pdf_path: Path to the input PDF file
        output_dir: Optional output directory (defaults to same as input)
    """
    input_path = Path(input_pdf_path)
    
    if not input_path.exists():
        print(f"ERROR: File not found: {input_path}")
        return False
    
    # Set output directory
    if output_dir:
        out_dir = Path(output_dir)
    else:
        out_dir = input_path.parent
    
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Read the PDF
    print(f"Reading PDF: {input_path.name}")
    reader = PdfReader(str(input_path))
    total_pages = len(reader.pages)
    
    print(f"Total pages: {total_pages}")
    
    if total_pages < 2:
        print("ERROR: PDF has less than 2 pages, cannot split")
        return False
    
    # Calculate midpoint
    mid_point = total_pages // 2
    
    # Create first half
    writer1 = PdfWriter()
    for page_num in range(0, mid_point):
        writer1.add_page(reader.pages[page_num])
    
    # Create second half
    writer2 = PdfWriter()
    for page_num in range(mid_point, total_pages):
        writer2.add_page(reader.pages[page_num])
    
    # Generate output filenames
    base_name = input_path.stem
    ext = input_path.suffix
    
    output1 = out_dir / f"{base_name}_part1{ext}"
    output2 = out_dir / f"{base_name}_part2{ext}"
    
    # Write output files
    print(f"\nWriting part 1 (pages 1-{mid_point}): {output1.name}")
    with open(output1, "wb") as f:
        writer1.write(f)
    
    print(f"Writing part 2 (pages {mid_point+1}-{total_pages}): {output2.name}")
    with open(output2, "wb") as f:
        writer2.write(f)
    
    print(f"\n✓ Successfully split PDF into 2 files:")
    print(f"  - {output1.name} ({mid_point} pages)")
    print(f"  - {output2.name} ({total_pages - mid_point} pages)")
    
    return True


def main():
    if len(sys.argv) < 2:
        print("PDF Splitter - Split a PDF file in half")
        print("\nUsage:")
        print(f"  python {Path(__file__).name} <pdf_file> [output_dir]")
        print("\nExample:")
        print(f"  python {Path(__file__).name} Module6.pdf")
        print(f"  python {Path(__file__).name} Module6.pdf ../_output/")
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = split_pdf_in_half(input_pdf, output_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
