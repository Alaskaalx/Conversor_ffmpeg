import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import subprocess
import os
from datetime import datetime
from pdf2docx import Converter

class UtilityApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Canivete Suíço - Mídia e Docs")
        self.root.geometry("550x350")
        
        
        self.base_out_dir = r"C:\Users\alcan\Videos\teste"
        
        
        self.notebook = ttk.Notebook(root)
        self.notebook.pack(expand=True, fill='both', padx=10, pady=10)
        
        self.tab_video = ttk.Frame(self.notebook)
        self.tab_pdf = ttk.Frame(self.notebook)
        self.tab_convert = ttk.Frame(self.notebook)
        
        self.notebook.add(self.tab_video, text="Recortar Vídeo")
        self.notebook.add(self.tab_pdf, text="PDF para Word")
        self.notebook.add(self.tab_convert, text="Converter Mídia")
        
        self.setup_video_tab()
        self.setup_pdf_tab()
        self.setup_convert_tab()

    def get_output_dir(self):
        """Cria e retorna a pasta com a data do dia"""
        date_str = datetime.now().strftime("%Y-%m-%d")
        out_dir = os.path.join(self.base_out_dir, date_str)
        os.makedirs(out_dir, exist_ok=True)
        return out_dir

    # ================= TAB VÍDEO =================
    def setup_video_tab(self):
        self.vid_path = tk.StringVar()
        
        ttk.Label(self.tab_video, text="1. Selecione o Vídeo:").pack(pady=(20, 5))
        frame_vid = ttk.Frame(self.tab_video)
        frame_vid.pack(fill='x', padx=20)
        ttk.Entry(frame_vid, textvariable=self.vid_path, state='readonly').pack(side='left', expand=True, fill='x')
        ttk.Button(frame_vid, text="Procurar", command=self.browse_video).pack(side='left', padx=5)
        
        ttk.Label(self.tab_video, text="2. Em quantas partes deseja dividir?").pack(pady=(20, 5))
        self.parts_spinbox = ttk.Spinbox(self.tab_video, from_=2, to=100, width=10)
        self.parts_spinbox.set(2)
        self.parts_spinbox.pack()
        
        ttk.Button(self.tab_video, text="Processar Recorte", command=self.process_video).pack(pady=30)

    def browse_video(self):
        file = filedialog.askopenfilename(filetypes=[("Vídeos", "*.mp4 *.mkv *.avi")])
        if file:
            self.vid_path.set(file)

    def process_video(self):
        video = self.vid_path.get()
        if not video:
            messagebox.showwarning("Aviso", "Selecione um vídeo primeiro.")
            return
            
        try:
            partes = int(self.parts_spinbox.get())
            out_dir = self.get_output_dir()
            filename = os.path.basename(video)
            name, ext = os.path.splitext(filename)
            
            
            cmd_duration = [
                'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1', video
            ]
            result = subprocess.run(cmd_duration, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            total_duration = float(result.stdout.strip())
            
            
            segment_time = total_duration / partes
            
            
            out_pattern = os.path.join(out_dir, f"{name}_parte_%03d{ext}")
            cmd_ffmpeg = [
                'ffmpeg', '-i', video, '-c', 'copy', '-map', '0',
                '-segment_time', str(segment_time), '-f', 'segment',
                '-reset_timestamps', '1', out_pattern
            ]
            
            subprocess.run(cmd_ffmpeg, check=True)
            messagebox.showinfo("Sucesso", f"Vídeo dividido em {partes} partes!\nSalvo em: {out_dir}")
            
        except Exception as e:
            messagebox.showerror("Erro", f"Falha ao processar: {str(e)}")

    # ================= TAB PDF =================
    def setup_pdf_tab(self):
        self.pdf_path = tk.StringVar()
        
        ttk.Label(self.tab_pdf, text="1. Selecione o PDF:").pack(pady=(20, 5))
        frame_pdf = ttk.Frame(self.tab_pdf)
        frame_pdf.pack(fill='x', padx=20)
        ttk.Entry(frame_pdf, textvariable=self.pdf_path, state='readonly').pack(side='left', expand=True, fill='x')
        ttk.Button(frame_pdf, text="Procurar", command=self.browse_pdf).pack(side='left', padx=5)
        
        ttk.Button(self.tab_pdf, text="Converter para Word", command=self.process_pdf).pack(pady=40)

    def browse_pdf(self):
        file = filedialog.askopenfilename(filetypes=[("PDF", "*.pdf")])
        if file:
            self.pdf_path.set(file)

    def process_pdf(self):
        pdf = self.pdf_path.get()
        if not pdf:
            messagebox.showwarning("Aviso", "Selecione um PDF primeiro.")
            return
            
        try:
            out_dir = self.get_output_dir()
            filename = os.path.basename(pdf)
            name, _ = os.path.splitext(filename)
            docx_file = os.path.join(out_dir, f"{name}.docx")
            
            cv = Converter(pdf)
            cv.convert(docx_file)
            cv.close()
            
            messagebox.showinfo("Sucesso", f"Convertido com sucesso!\nSalvo em: {docx_file}")
            
        except Exception as e:
            messagebox.showerror("Erro", f"Falha na conversão: {str(e)}")
            # ================= TAB CONVERSÃO DE VÍDEO =================
    def setup_convert_tab(self):
        self.conv_vid_path = tk.StringVar()
        
        ttk.Label(self.tab_convert, text="1. Selecione o Vídeo:").pack(pady=(20, 5))
        frame_conv = ttk.Frame(self.tab_convert)
        frame_conv.pack(fill='x', padx=20)
        ttk.Entry(frame_conv, textvariable=self.conv_vid_path, state='readonly').pack(side='left', expand=True, fill='x')
        ttk.Button(frame_conv, text="Procurar", command=self.browse_conv_video).pack(side='left', padx=5)
        
        ttk.Label(self.tab_convert, text="2. Perfil de Conversão:").pack(pady=(20, 5))
        self.profile_var = tk.StringVar()
        perfis = ["MP4 Padrão (H.264 Alta Qualidade)", "Otimizado para WhatsApp (720p, CRF 28)"]
        self.profile_combo = ttk.Combobox(self.tab_convert, textvariable=self.profile_var, values=perfis, state="readonly", width=40)
        self.profile_combo.current(0)
        self.profile_combo.pack()
        
        ttk.Button(self.tab_convert, text="Iniciar Conversão", command=self.process_conversion).pack(pady=30)

    def browse_conv_video(self):
        file = filedialog.askopenfilename(filetypes=[("Vídeos", "*.mp4 *.mkv *.avi *.mov *.webm")])
        if file:
            self.conv_vid_path.set(file)

    def process_conversion(self):
        video = self.conv_vid_path.get()
        if not video:
            messagebox.showwarning("Aviso", "Selecione um vídeo primeiro.")
            return
            
        try:
            out_dir = self.get_output_dir()
            filename = os.path.basename(video)
            name, _ = os.path.splitext(filename)
            out_file = os.path.join(out_dir, f"{name}_convertido.mp4")
            
            perfil = self.profile_combo.get()
            
            # Montagem dinâmica dos argumentos do FFmpeg baseada no perfil
            if "WhatsApp" in perfil:
                cmd_ffmpeg = [
                    'ffmpeg', '-y', '-i', video,
                    '-vcodec', 'libx264', '-crf', '28', '-preset', 'fast',
                    '-vf', 'scale=-1:720', '-acodec', 'aac', '-b:a', '128k',
                    out_file
                ]
            else:
                cmd_ffmpeg = [
                    'ffmpeg', '-y', '-i', video,
                    '-vcodec', 'libx264', '-crf', '18', '-preset', 'fast',
                    '-acodec', 'aac', '-b:a', '192k',
                    out_file
                ]
            
            # Executa o processo de conversão
            subprocess.run(cmd_ffmpeg, check=True)
            messagebox.showinfo("Sucesso", f"Conversão concluída!\nSalvo em: {out_file}")
            
        except subprocess.CalledProcessError as e:
            messagebox.showerror("Erro do FFmpeg", f"O processamento falhou.\n{str(e)}")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um problema: {str(e)}")
            
if __name__ == "__main__":
    root = tk.Tk()
    app = UtilityApp(root)
    root.mainloop()