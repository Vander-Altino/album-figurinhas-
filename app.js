// ===================================================
// CONFIGURAÇÃO DA API (Automática Local / Online)
// ===================================================
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://album-figurinhas-u75f.onrender.com";

// ===================================================
// FUNÇÃO: Preenche os slots do álbum com imagens da API
// Esta função é chamada após o álbum ser inicializado.
// ===================================================

async function preencherFigurinhas() {
    try {
        // 1. Busca as figurinhas disponíveis na API
        const response = await fetch(`${API_BASE_URL}/figurinhas`);

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        // 2. Converte o JSON em array JavaScript
        const figurinhas = await response.json();

        // 3. Cria um Map de id → figurinha para lookup rápido
        //    Ex: 1 → { id: 1, nome: "Seiya de Pégaso", imagem_url: "/imgs/01-seiya-de-pegaso.jpg" }
        const porId = new Map(figurinhas.map(f => [f.id, f]));

        // 4. Percorre todos os slots do HTML
        const slots = document.querySelectorAll(".sticker-slot");

        for (const slot of slots) {
            const slotNumeroEl = slot.querySelector(".slot-number");
            if (!slotNumeroEl) continue;

            // Extrai o número do slot: "#01" → 1
            const id = parseInt(slotNumeroEl.textContent.replace("#", ""), 10);

            if (!porId.has(id)) continue;

            // A figurinha existe: insere a imagem
            const figurinha = porId.get(id);

            const img = document.createElement("img");
            img.src = `${API_BASE_URL}${figurinha.imagem_url}`;
            img.alt = figurinha.nome;
            img.className = "sticker-img";

            img.onload = () => slot.classList.add("slot-preenchido");
            img.onerror = () => console.warn(`Imagem de lenda não encontrada: ${figurinha.nome}`);

            slot.insertBefore(img, slot.firstChild);
        }

        console.log(`✅ ${figurinhas.length} figurinhas de animes carregadas da API!`);

    } catch (erro) {
        console.warn("⚠️  Não foi possível conectar à API do backend de animes:", erro.message);
        console.info("ℹ️  Inicie o servidor localmente ou verifique a URL da API em produção.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const bookElement = document.getElementById("book");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const soundToggle = document.getElementById("sound-toggle");
    const iconOn = soundToggle.querySelector(".sound-icon-on");
    const iconOff = soundToggle.querySelector(".sound-icon-off");

    let isMuted = false;
    let pageFlip = null;

    // 1. Initialize St.PageFlip
    try {
        pageFlip = new St.PageFlip(bookElement, {
            width: 550, // Base page width
            height: 800, // Base page height
            size: "stretch",
            minWidth: 315,
            maxWidth: 1000,
            minHeight: 420,
            maxHeight: 1350,
            drawShadow: true,
            maxShadowOpacity: 0.4,
            showCover: true,
            mobileScrollSupport: true,
            useMouseEvents: false,
            showPageCorners: false,
            disableFlipByClick: true,
            flippingTime: 800
        });

        // Load pages from HTML
        pageFlip.loadFromHTML(document.querySelectorAll(".page"));

        let activeDragPage = null;
        let isClicking = false;
        let startX = 0;
        let startY = 0;
        let dragStarted = false;

        document.querySelectorAll(".page").forEach((page, index) => {
            page.addEventListener("mousedown", (e) => {
                if (e.target.closest("button") || e.target.closest("a")) return;
                isClicking = true;
                startX = e.clientX;
                startY = e.clientY;
                dragStarted = false;
                activeDragPage = { page, index };
            });

            page.addEventListener("touchstart", (e) => {
                if (e.target.closest("button") || e.target.closest("a")) return;
                const touch = e.touches[0];
                isClicking = true;
                startX = touch.clientX;
                startY = touch.clientY;
                dragStarted = false;
                activeDragPage = { page, index };
            });
        });

        const handleMove = (clientX, clientY, isTouch = false) => {
            if (!isClicking || !activeDragPage) return;
            
            const deltaX = clientX - startX;
            const deltaY = clientY - startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            const bookRect = bookElement.getBoundingClientRect();

            if (distance > 10 && !dragStarted) {
                dragStarted = true;
                let cornerX, cornerY;
                
                const centerY = bookRect.top + bookRect.height / 2;
                if (startY < centerY) {
                    cornerY = 0;
                } else {
                    cornerY = bookRect.height;
                }

                if (activeDragPage.index % 2 === 0) {
                    cornerX = bookRect.width;
                } else {
                    cornerX = 0;
                }
                
                document.body.classList.add("dragging");
                pageFlip.startUserTouch({ x: cornerX, y: cornerY });
            }
            
            if (dragStarted) {
                const relX = clientX - bookRect.left;
                const relY = clientY - bookRect.top;
                pageFlip.userMove({ x: relX, y: relY }, isTouch);
            }
        };

        const handleRelease = (clientX, clientY, isTouch = false) => {
            if (dragStarted) {
                const bookRect = bookElement.getBoundingClientRect();
                const relX = clientX - bookRect.left;
                const relY = clientY - bookRect.top;
                pageFlip.userStop({ x: relX, y: relY }, isTouch);
            }
            isClicking = false;
            dragStarted = false;
            activeDragPage = null;
            document.body.classList.remove("dragging");
        };

        window.addEventListener("mousemove", (e) => {
            handleMove(e.clientX, e.clientY, false);
        });

        window.addEventListener("touchmove", (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY, true);
            }
        });

        window.addEventListener("mouseup", (e) => {
            handleRelease(e.clientX, e.clientY, false);
        });

        window.addEventListener("touchend", (e) => {
            const touch = e.changedTouches[0] || e.touches[0];
            if (touch) {
                handleRelease(touch.clientX, touch.clientY, true);
            } else {
                handleRelease(startX, startY, true);
            }
        });

        bookElement.style.display = "block";
        preencherFigurinhas();

    } catch (error) {
        console.error("Erro ao inicializar a biblioteca PageFlip:", error);
    }

    function playPaperTurnSound() {
        if (isMuted) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const audioCtx = new AudioContext();
            const duration = 0.45;
            const sampleRate = audioCtx.sampleRate;
            const bufferSize = sampleRate * duration;
            const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const progress = i / bufferSize;
                const noise = Math.random() * 2 - 1;

                let envelope = 0;
                if (progress < 0.3) {
                    envelope = progress / 0.3;
                } else {
                    envelope = (1 - progress) / 0.7;
                }

                const paperCrackle = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.35 : 0;

                data[i] = (noise * 0.65 + paperCrackle) * envelope * 0.12;
            }

            const noiseNode = audioCtx.createBufferSource();
            noiseNode.buffer = buffer;

            const bandpassFilter = audioCtx.createBiquadFilter();
            bandpassFilter.type = "bandpass";
            bandpassFilter.Q.value = 2.0;

            bandpassFilter.frequency.setValueAtTime(1500, audioCtx.currentTime);
            bandpassFilter.frequency.exponentialRampToValueAtTime(350, audioCtx.currentTime + duration);

            const lowpassFilter = audioCtx.createBiquadFilter();
            lowpassFilter.type = "lowpass";
            lowpassFilter.frequency.setValueAtTime(3800, audioCtx.currentTime);

            noiseNode.connect(bandpassFilter);
            bandpassFilter.connect(lowpassFilter);
            lowpassFilter.connect(audioCtx.destination);

            noiseNode.start();
        } catch (e) {
            console.warn("Falha ao tocar som de virada de página:", e);
        }
    }

    soundToggle.addEventListener("click", () => {
        isMuted = !isMuted;
        if (isMuted) {
            iconOn.classList.add("hidden");
            iconOff.classList.remove("hidden");
        } else {
            iconOn.classList.remove("hidden");
            iconOff.classList.add("hidden");
        }
    });

    if (pageFlip) {
        pageFlip.on("changeState", (e) => {
            if (e.data === "flipping") {
                playPaperTurnSound();
            }
        });

        pageFlip.on("flip", (e) => {
            const currentPage = e.data;
            const totalPages = pageFlip.getPageCount();

            if (currentPage === 0) {
                btnPrev.classList.add("hidden");
            } else {
                btnPrev.classList.remove("hidden");
            }

            if (currentPage === totalPages - 1) {
                btnNext.classList.add("hidden");
            } else {
                btnNext.classList.remove("hidden");
            }
        });

        btnPrev.addEventListener("click", () => {
            pageFlip.flipPrev();
        });

        btnNext.addEventListener("click", () => {
            pageFlip.flipNext();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") {
                pageFlip.flipPrev();
            } else if (e.key === "ArrowRight") {
                pageFlip.flipNext();
            }
        });

        btnPrev.classList.add("hidden");
    }
});
