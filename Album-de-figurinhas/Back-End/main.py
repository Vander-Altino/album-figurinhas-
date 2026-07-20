import os
import glob
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

# Cria a instância da aplicação FastAPI
app = FastAPI()

# Configuração do Middleware CORS para aceitar qualquer origem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define caminhos absolutos para a pasta de imagens
PASTA_BASE = os.path.dirname(os.path.abspath(__file__))
PASTA_IMAGENS = os.path.join(PASTA_BASE, "figurinhas")

# Lista contendo todas as figurinhas da pasta de acordo com suas extensões
figurinhas = [
    {"id": 1, "nome": "Seya", "categoria": "Fundadores do império Anime", "imagem_url": "/figurinhas/1/imagem"},
    {"id": 2, "nome": "Sailor", "categoria": "Fundadores do império Anime", "imagem_url": "/figurinhas/2/imagem"},
    {"id": 3, "nome": "Goku", "categoria": "Fundadores do império Anime", "imagem_url": "/figurinhas/3/imagem"},
    {"id": 4, "nome": "Yusuke", "categoria": "Fundadores do império Anime", "imagem_url": "/figurinhas/4/imagem"},
    {"id": 5, "nome": "Spike", "categoria": "Fundadores do império Anime", "imagem_url": "/figurinhas/5/imagem"},
    {"id": 6, "nome": "Naruto", "categoria": "A Trindade de Ouro e Herdeiros", "imagem_url": "/figurinhas/6/imagem"},
    {"id": 7, "nome": "Ichigo", "categoria": "A Trindade de Ouro e Herdeiros", "imagem_url": "/figurinhas/7/imagem"},
    {"id": 8, "nome": "Luffy", "categoria": "A Trindade de Ouro e Herdeiros", "imagem_url": "/figurinhas/8/imagem"},
    {"id": 9, "nome": "Edward", "categoria": "A Trindade de Ouro e Herdeiros", "imagem_url": "/figurinhas/9/imagem"},
    {"id": 10, "nome": "Killua", "categoria": "A Trindade de Ouro e Herdeiros", "imagem_url": "/figurinhas/10/imagem"},
    {"id": 11, "nome": "Kame", "categoria": "Guias da Sabedoria e Poder", "imagem_url": "/figurinhas/11/imagem"},
    {"id": 12, "nome": "Kakashi", "categoria": "Guias da Sabedoria e Poder", "imagem_url": "/figurinhas/12/imagem"},
    {"id": 13, "nome": "Gojo", "categoria": "Guias da Sabedoria e Poder", "imagem_url": "/figurinhas/13/imagem"},
    {"id": 14, "nome": "Jiraya", "categoria": "Guias da Sabedoria e Poder", "imagem_url": "/figurinhas/14/imagem"},
    {"id": 15, "nome": "Levi", "categoria": "Guias da Sabedoria e Poder", "imagem_url": "/figurinhas/15/imagem"},
    {"id": 16, "nome": "Frieza", "categoria": "Antogonistas Incônicos", "imagem_url": "/figurinhas/16/imagem"},
    {"id": 17, "nome": "Madara", "categoria": "Antogonistas Incônicos", "imagem_url": "/figurinhas/17/imagem"},
    {"id": 18, "nome": "Light", "categoria": "Antogonistas Incônicos", "imagem_url": "/figurinhas/18/imagem"},
    {"id": 19, "nome": "Hisoka", "categoria": "Antogonistas Incônicos", "imagem_url": "/figurinhas/19/imagem"},
    {"id": 20, "nome": "Aizen", "categoria": "Antogonistas Incônicos", "imagem_url": "/figurinhas/20/imagem"},
    {"id": 21, "nome": "Tanjiro", "categoria": "A Revolução do Anime Moderno", "imagem_url": "/figurinhas/21/imagem"},
    {"id": 22, "nome": "Eren", "categoria": "A Revolução do Anime Moderno", "imagem_url": "/figurinhas/22/imagem"},
    {"id": 23, "nome": "Saitama", "categoria": "A Revolução do Anime Moderno", "imagem_url": "/figurinhas/23/imagem"},
    {"id": 24, "nome": "Deku", "categoria": "A Revolução do Anime Moderno", "imagem_url": "/figurinhas/24/imagem"},
    {"id": 25, "nome": "Mob", "categoria": "A Revolução do Anime Moderno", "imagem_url": "/figurinhas/25/imagem"},
    {"id": 26, "nome": "Totoro", "categoria": "Mundos Mágicos e Cinema", "imagem_url": "/figurinhas/26/imagem"},
    {"id": 27, "nome": "Chihiro", "categoria": "Mundos Mágicos e Cinema", "imagem_url": "/figurinhas/27/imagem"},
    {"id": 28, "nome": "Ashitaka", "categoria": "Mundos Mágicos e Cinema", "imagem_url": "/figurinhas/28/imagem"},
    {"id": 29, "nome": "Howl", "categoria": "Mundos Mágicos e Cinema", "imagem_url": "/figurinhas/29/imagem"},
    {"id": 30, "nome": "Vander", "categoria": "Mundos Mágicos e Cinema", "imagem_url": "/figurinhas/30/imagem"}
]

# Endpoint GET "/figurinhas" para listar todas as figurinhas ativas
@app.get("/figurinhas")
def listar_figurinhas():
    return figurinhas

# Endpoint GET "/figurinhas/{id}/imagem" para entregar o arquivo da imagem
@app.get("/figurinhas/{id}/imagem")
def obter_imagem(id: int):
    padrao = os.path.join(PASTA_IMAGENS, f"{id}-*")
    arquivos = glob.glob(padrao)
    
    if not arquivos:
        raise HTTPException(status_code=404, detail="Imagem não encontrada")
    
    return FileResponse(arquivos[0])

# Inicialização para rodar diretamente via python se necessário
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)