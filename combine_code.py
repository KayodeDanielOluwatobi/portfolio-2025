import os

def combine_specific_code_files(output_path):
    """
    Reads a hardcoded list of .tsx and .css files, combines their content into a
    single .txt file with headings for each file.

    Args:
        output_path (str): The full path for the combined output .txt file.
    """

    # --- Hardcoded list of absolute paths to the files you want to combine ---
    files_to_combine_absolute = [
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\components\layout\Bio.tsx',
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\components\layout\Header.tsx',
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\components\layout\Hero.tsx',
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\components\layout\SmoothCursor.tsx',
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\components\layout\ViewportIndicator.tsx',
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\app\page.tsx',
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\app\layout.tsx',
        r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\portfolio\src\app\globals.css',
    ]
    # --------------------------------------------------------------------------

    # For consistent output, sort files by their base name.
    # We'll extract the base name from the absolute path for sorting.
    files_to_combine_absolute.sort(key=lambda x: os.path.basename(x))


    with open(output_path, 'w', encoding='utf-8') as outfile:
        for file_path in files_to_combine_absolute:
            # Extract a user-friendly name for the heading (e.g., "Bio.tsx" or "app/page.tsx")
            # We'll try to make it relative to the 'src' directory if possible for better readability
            try:
                # Find the 'src' part in the path to make it relative to that.
                # This makes headings like 'app\page.tsx' or 'components\layout\Header.tsx'
                src_index = file_path.lower().rfind(os.path.join('src', '').lower())
                if src_index != -1:
                    heading_name = file_path[src_index + len(os.path.join('src', '')):]
                else:
                    heading_name = os.path.basename(file_path) # Fallback to just filename
            except Exception:
                heading_name = os.path.basename(file_path) # Fallback in case of path manipulation error


            outfile.write("=" * 40 + "\n")
            outfile.write(f"{heading_name}\n")
            outfile.write("=" * 40 + "\n\n")

            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        outfile.write(infile.read())
                    outfile.write("\n\n") # Add extra newlines for separation
                except Exception as e:
                    outfile.write(f"--- Error reading file '{file_path}': {e} ---\n\n")
            else:
                outfile.write(f"--- File not found at path: {file_path} ---\n\n")
                print(f"Warning: File not found: {file_path}")


    print(f"Successfully combined code into: {output_path}")

# --- Configuration ---
# Set your desired output file path here
OUTPUT_FILE_PATH = r'C:\Users\Everdann\Desktop\Everdann\Portfolio Website\everdann\combined_output.txt'
# ---------------------

if __name__ == "__main__":
    combine_specific_code_files(OUTPUT_FILE_PATH)