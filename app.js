// ===================================================
// CONFIGURAÇÃO DA API (Automática Local / Online)
// ===================================================
const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://album-figurinhas-u75f.onrender.com";

// ===================================================
// FUNÇÃO: Preenche os slots do álbum com imagens da API
// ===================================================
async function preencherFigurinhas() {
    try {
        const response = await fetch(`${API_BASE_URL}/figurinhas`);

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const figurinhas = await response.json();
        const porId = new Map(figurinhas.map(f => [f.id, f]));
        const slots = document.querySelectorAll(".sticker-slot");

        for (const slot of slots) {
            const slotNumeroEl = slot.querySelector(".slot-number");
            if (!slotNumeroEl) continue;

            const id = parseInt(slotNumeroEl.textContent.replace("#", ""), 10);
            if (!porId.has(id)) continue;

            const figurinha = porId.get(id);

            const img = document.createElement("img");
            img.src = `${API_BASE_URL}${figurinha.imagem_url}`;
            img.alt = figurinha.nome;
            img.className = "sticker-img";

            img.onload = () => slot.classList.add("slot-preenchido");
            img.onerror = () => console.warn(`Imagem não encontrada: ${figurinha.nome}`);

            slot.insertBefore(img, slot.firstChild);
        }

        console.log(`✅ ${figurinhas.length} figurinhas carregadas da API!`);

    } catch (erro) {
        console.warn("⚠️ Não foi possível conectar à API:", erro.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const bookElement = document.getElementById("book");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const soundToggle = document.getElementById("sound-toggle");
    const iconOn = soundToggle ? soundToggle.querySelector(".sound-icon-on") : null;
    const iconOff = soundToggle ? soundToggle.querySelector(".sound-icon-off") : null;

    let isMuted = false;
    let pageFlip = null;

    try {
        pageFlip = new St.PageFlip(bookElement, {
            width: 550,
            height: 800,
            size: "fit", // Ajustado para escalar proporcionalmente sem cortes no mobile
            minWidth: 280,
            maxWidth: 800,
            minHeight: 400,
            maxHeight: 1100,
            drawShadow: true,
            maxShadowOpacity: 0.4,
            showCover: true,
            mobileScrollSupport: false,
            useMouseEvents: true, // Garante interatividade otimizada por toque
            showPageCorners: true,
            disableFlipByClick: false,
            flippingTime: 600
        });

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
                cornerY = startY < centerY ? 0 : bookRect.height;
                cornerX = activeDragPage.index % 2 === 0 ? bookRect.width : 0;
                
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

        window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY, false));
        window.addEventListener("touchmove", (e) => {
            if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY, true);
        });

        window.addEventListener("mouseup", (e) => handleRelease(e.clientX, e.clientY, false));
        window.addEventListener("touchend", (e) => {
            const touch = e.changedTouches[0] || e.touches[0];
            if (touch) handleRelease(touch.clientX, touch.clientY, true);
            else handleRelease(startX, startY, true);
        });

        bookElement.style.display = "block";
        preencherFigurinhas();

    } catch (error) {
        console.error("Erro ao inicializar PageFlip:", error);
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
                const envelope = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
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
            console.warn("Falha ao tocar som:", e);
        }
    }

    if (soundToggle) {
        soundToggle.addEventListener("click", () => {
            isMuted = !isMuted;
            if (isMuted) {
                if (iconOn) iconOn.classList.add("hidden");
                if (iconOff) iconOff.classList.remove("hidden");
            } else {
                if (iconOn) iconOn.classList.remove("hidden");
                if (iconOff) iconOff.classList.add("hidden");
            }
        });
    }

    if (pageFlip) {
        pageFlip.on("changeState", (e) => {
            if (e.data === "flipping") playPaperTurnSound();
        });

        pageFlip.on("flip", (e) => {
            const currentPage = e.data;
            const totalPages = pageFlip.getPageCount();

            if (currentPage === 0) btnPrev.classList.add("hidden");
            else btnPrev.classList.remove("hidden");

            if (currentPage === totalPages - 1) btnNext.classList.add("hidden");
            else btnNext.classList.remove("hidden");
        });

        if (btnPrev) btnPrev.addEventListener("click", () => pageFlip.flipPrev());
        if (btnNext) btnNext.addEventListener("click", () => pageFlip.flipNext());

        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") pageFlip.flipPrev();
            else if (e.key === "ArrowRight") pageFlip.flipNext();
        });

        if (btnPrev) btnPrev.classList.add("hidden");
    }
});
