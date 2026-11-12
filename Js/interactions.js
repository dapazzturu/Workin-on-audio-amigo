
(() => {
    const $ = (id) => document.getElementById(id);
    const cfg = window.BEYOND_CONFIG;

    window.BeyondToast = (msg) => {
        const t = $("toast");

        t.textContent = msg;
        t.classList.add("show");

        clearTimeout(t._timer);

        t._timer = setTimeout(() => {
            t.classList.remove("show");
        }, 2400);
    };

    let note = 0;
    let descentTimer = null;
    let factTimer = null;
    let factSwapTimer = null;
    let factIndex = 0;

    const loadingFacts = (cfg.loadingFacts && cfg.loadingFacts.length)
        ? cfg.loadingFacts
        : ["FUN FACT #1: I LOVE YOU."];

    const FACT_INTERVAL = cfg.loadingFactInterval || 1700;

    // ==========================================
    // LOADING FACTS (Descent caption)
    // ==========================================

    function setFact(text, animate) {
        const el = $("descentCaption");

        clearTimeout(factSwapTimer);

        if (!animate) {
            el.classList.remove("is-swapping");
            el.textContent = text;
            return;
        }

        // fade out -> swap text -> fade in
        el.classList.add("is-swapping");

        factSwapTimer = setTimeout(() => {
            el.textContent = text;
            el.classList.remove("is-swapping");
        }, 280);
    }

    function stopFacts() {
        clearInterval(factTimer);
        clearTimeout(factSwapTimer);
        factTimer = null;
    }

    function startFacts() {
        stopFacts();

        factIndex = 0;
        setFact(loadingFacts[factIndex], false);

        factTimer = setInterval(() => {
            factIndex = (factIndex + 1) % loadingFacts.length;
            setFact(loadingFacts[factIndex], true);
        }, FACT_INTERVAL);
    }

    // ==========================================
    // DESCENT PROGRESS
    // ==========================================

    function setDescentProgress(p) {
        // p: 0..1  (0 = start, 1 = arrived)
        document.body.style.setProperty("--descent", p.toFixed(3));
        window.BeyondStarfield?.setWarp(Math.min(1, p * 1.5));

        const remaining = Math.round(100 - p * 100);

        $("distanceValue").textContent = "Distance: " + remaining + "%";
        $("distanceBar").style.width = remaining + "%";
    }

    function stopDescent() {
        clearInterval(descentTimer);
        descentTimer = null;

        stopFacts();

        window.BeyondStarfield?.setWarp(0);
    }

    // Whenever the visitor leaves the Descent (by any route), its timers stop.
    document.addEventListener("beyond:scene", (e) => {
        if (e.detail.name !== "descent") stopDescent();
    });

    // ==========================================
    // THE BIG STAGE  (one scene per star)
    // ==========================================

    const stageHost = $("planetSystem");
    const stages = Array.from(stageHost.querySelectorAll(".stage"));
    const starNodes = Array.from(document.querySelectorAll(".star-node"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pad2 = (v) => String(v).padStart(2, "0");

    // The heart is drawn from stars placed along its own outline.
    function buildHeartStars() {
        const path = $("heartPath");
        const holder = $("heartStars");

        if (!path || !holder || holder.childElementCount) return;

        const total = 12;
        const length = path.getTotalLength();
        const ns = "http://www.w3.org/2000/svg";

        for (let i = 0; i < total; i++) {
            const pt = path.getPointAtLength(length * i / total);
            const c = document.createElementNS(ns, "circle");

            c.setAttribute("class", "heart-star");
            c.setAttribute("cx", pt.x.toFixed(1));
            c.setAttribute("cy", pt.y.toFixed(1));
            c.setAttribute("r", i % 3 === 0 ? "3.6" : "2.5");
            // they appear in step with the line being drawn
            c.style.animationDelay = (0.3 + 2.4 * i / total).toFixed(2) + "s";

            holder.appendChild(c);
        }
    }

    buildHeartStars();

    function setStage(i) {
        const index = i % stages.length;
        const names = cfg.stageNames || [];

        stages.forEach((st, k) => {
            const on = k === index;
            const svg = st.querySelector("svg");

            st.classList.toggle("is-active", on);

            // SMIL motion (moon companion, comet) only runs while visible
            if (svg && svg.pauseAnimations) {
                if (reduceMotion.matches) {
                    svg.setCurrentTime(2.6);
                    svg.pauseAnimations();
                } else if (on) {
                    svg.unpauseAnimations();
                } else {
                    svg.pauseAnimations();
                }
            }
        });

        stageHost.dataset.stage = index;

        if (names[index]) $("stageName").textContent = names[index];
        $("stageCount").textContent = pad2(index + 1) + " / " + pad2(stages.length);

        starNodes.forEach((node, k) => node.classList.toggle("is-active", k === index));
    }

    // ==========================================
    // STAR MESSAGES
    // ==========================================

    function nextNote(n, silent) {
        note = (n + cfg.messages.length) % cfg.messages.length;

        const text = $("messageText");

        text.textContent = cfg.messages[note];

        // let the new words arrive instead of simply replacing the old ones
        text.classList.remove("swap");
        void text.offsetWidth;
        text.classList.add("swap");

        $("messageCard")
            .querySelector(".message-index")
            .textContent =
            "Star " + String(note + 1).padStart(2, "0");

        setStage(note);

        if (!silent) window.BeyondAudio?.playSfx("transition");
    }

    document.querySelectorAll(".star-node").forEach((node, i) => {
        node.setAttribute("role", "button");
        node.setAttribute("tabindex", "0");
        node.setAttribute("aria-label", "Star " + (i + 1));

        node.addEventListener("click", () => nextNote(i));
        node.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                nextNote(i);
            }
        });
    });

    $("nextMessage").addEventListener("click", () => {
        nextNote(note + 1);
    });

    // Initial state is driven by config so the HTML text can never drift out of sync.
    nextNote(0, true);

    // ==========================================
    // BEGIN JOURNEY
    // ==========================================

    $("beginJourney").addEventListener("click", () => {

        // Music starts after user interaction (browser autoplay policy)
        window.BeyondAudio?.playMusic(true);

        window.BeyondAudio?.playSfx("descent");

        window.BeyondScenes.show("descent");

        setDescentProgress(0);
        startFacts();

        const start = performance.now();

        clearInterval(descentTimer);

        descentTimer = setInterval(() => {
            const p = Math.min(1, (performance.now() - start) / cfg.descentDuration);

            setDescentProgress(p);

            if (p >= 1) {
                clearInterval(descentTimer);
                descentTimer = null;

                window.BeyondAudio?.playSfx("whitehole");

                // show() also stops the descent timers/facts via the scene event
                window.BeyondScenes.show("whitehole");
            }

        }, 50);
    });

    // ==========================================
    // WHITE HOLE  ->  THE UNIVERSE
    // ==========================================

    $("emergeButton").addEventListener("click", () => {
        window.BeyondAudio?.playSfx("transition");

        window.BeyondScenes.show("universe");
    });

    // ==========================================
    // PLANET
    // ==========================================

    $("planetButton").addEventListener("click", () => {
        window.BeyondToast(
            "A quiet world, holding little wonders."
        );

        window.BeyondAudio?.playSfx("whitehole");
    });

    // ==========================================
    // THE UNIVERSE  ->  THE LETTER
    // ==========================================

    $("toLetter").addEventListener("click", () => {
        window.BeyondAudio?.playSfx("transition");

        window.BeyondScenes.show("letter");
    });

    // ==========================================
    // LETTER
    // ==========================================

    $("openLetter").addEventListener("click", () => {

        // Opening twice would only replay the chime.
        if ($("openLetter").classList.contains("open")) return;

        $("openLetter").classList.add("open");

        $("letterContent").classList.add("visible");

        $("scene-letter").classList.add("letter-opened");

        $("envelopeHint").textContent =
            "A little note, just for you";

        $("finalReveal").classList.add("visible");

        window.BeyondAudio?.playSfx("letter");

        // Bring the opened letter into view from its top.
        setTimeout(() => {
            $("scene-letter").scrollTo({ top: 0, behavior: "smooth" });
        }, 60);
    });

    // ==========================================
    // FINALE
    // ==========================================

    // A quiet scatter of twinkling points behind the final message.
    // Created once, animated with opacity only (cheap on phones).
    function buildFinaleStars() {
        const holder = document.querySelector(".finale-stars");

        if (!holder || holder.childElementCount) return;

        const total = window.innerWidth < 761 ? 26 : 44;
        const frag = document.createDocumentFragment();

        for (let i = 0; i < total; i++) {
            const s = document.createElement("i");
            const size = (Math.random() * 2.2 + 1).toFixed(1);

            s.style.left = (Math.random() * 96 + 1).toFixed(1) + "%";
            s.style.top = (Math.random() * 96 + 1).toFixed(1) + "%";
            s.style.width = s.style.height = size + "px";
            s.style.animationDelay = (Math.random() * 5).toFixed(2) + "s";
            s.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + "s";

            frag.appendChild(s);
        }

        holder.appendChild(frag);
    }

    buildFinaleStars();

    $("finalReveal").addEventListener("click", () => {
        window.BeyondAudio?.playSfx("finale");

        window.BeyondScenes.show("finale");
    });

    // ==========================================
    // REPLAY / RESET
    // ==========================================

    function resetJourney() {
        stopDescent();

        setDescentProgress(0);

        $("openLetter").classList.remove("open");

        $("letterContent").classList.remove("visible");

        $("finalReveal").classList.remove("visible");

        $("scene-letter").classList.remove("letter-opened");

        $("envelopeHint").textContent =
            "There is something here for you";

        nextNote(0, true);

        window.BeyondScenes.show("intro");
    }

    $("replayJourney").addEventListener("click", () => {
        window.BeyondAudio?.playSfx("transition");

        resetJourney();
    });

    // Escape returns to the beginning (cleanly, with timers stopped).
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && window.BeyondScenes.current !== "intro") {
            resetJourney();
        }
    });

})();
