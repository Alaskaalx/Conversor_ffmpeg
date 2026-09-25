import sys
from pdf2docx import Converter

def converter_pdf_para_word(pdf_input, docx_output):
    try:
        cv = Converter(pdf_input)
        cv.convert(docx_output)
        cv.close()
        print("SUCESSO")
    except Exception as e:
        print(f"ERRO: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        converter_pdf_para_word(input_file, output_file)
    else:
        print("ERRO: Argumentos insuficientes.")