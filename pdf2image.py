import sys
import fitz  # PyMuPDF
import os

def converter_pdf_para_imagem(pdf_input, output_dir, base_name):
    try:
        # Abre o documento PDF
        doc = fitz.open(pdf_input)
        
        for i in range(len(doc)):
            page = doc.load_page(i)
            # Renderiza a página em imagem (dpi=150 garante boa leitura)
            pix = page.get_pixmap(dpi=150) 
            
            # Formata o nome: arquivoOriginal_pagina_1.jpg
            output_file = os.path.join(output_dir, f"{base_name}_pagina_{i+1}.jpg")
            pix.save(output_file)
            
        print("SUCESSO")
    except Exception as e:
        print(f"ERRO: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 3:
        input_file = sys.argv[1]
        out_dir = sys.argv[2]
        base_name = sys.argv[3]
        converter_pdf_para_imagem(input_file, out_dir, base_name)
    else:
        print("ERRO: Argumentos insuficientes.")