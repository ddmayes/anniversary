
// ==================================================
// MEMORY QUIZ
// ==================================================

const quiz = document.querySelector('.memory-quiz');

if (quiz) {
    const options = quiz.querySelectorAll('input[type="radio"]');
    const message = document.getElementById('quiz-message');

    options.forEach(option => {
        option.addEventListener('change', () => {
            message.textContent = option.value === 'correct'
                ? "Of course! You remember everything ♡"
                : "Not quite... try again, my love ♡";
        });
    });
}


// ==================================================
// JIGSAW PUZZLE
// ==================================================

const puzzleBoard = document.getElementById('puzzle-board');
const puzzleTray = document.getElementById('puzzle-tray');
const puzzleInstruction = document.getElementById('puzzle-instruction');
const puzzleContainer = document.getElementById('puzzle-container');
const puzzleComplete = document.getElementById('puzzle-complete');

if (puzzleBoard && puzzleTray && puzzleContainer && puzzleComplete) {

    const SIZE = 4;
    const TOTAL = SIZE * SIZE;

    let selectedPiece = null;
    let activeDrag = null;
    let suppressClickUntil = 0;
    let completed = false;

    const slots = [];
    const pieces = [];


    // --------------------------------------------------
    // PLACEHOLDER: PRESERVES THE PIECE'S TRAY POSITION
    // --------------------------------------------------

    function createPlaceholder(piece) {
        const placeholder = document.createElement('div');

        placeholder.className = 'puzzle-placeholder';
        placeholder.setAttribute('aria-hidden', 'true');

        piece.parentElement.insertBefore(placeholder, piece);

        return placeholder;
    }


    // --------------------------------------------------
    // CLEAR TEMPORARY DRAG STYLES
    // --------------------------------------------------

    function clearDragStyles(piece) {
        piece.style.position = '';
        piece.style.left = '';
        piece.style.top = '';
        piece.style.width = '';
        piece.style.height = '';
        piece.style.margin = '';
        piece.style.zIndex = '';
        piece.style.transform = '';
        piece.style.pointerEvents = '';
        piece.style.touchAction = '';
    }


    // --------------------------------------------------
    // RESTORE PIECE TO ITS ORIGINAL POSITION
    // --------------------------------------------------

    function restorePiece(drag) {
        if (drag.placeholder && drag.placeholder.parentElement) {
            drag.placeholder.replaceWith(drag.piece);
        } else {
            drag.origin.appendChild(drag.piece);
        }

        clearDragStyles(drag.piece);
    }


    // --------------------------------------------------
    // CREATE BOARD SLOTS
    // --------------------------------------------------

    for (let i = 0; i < TOTAL; i++) {
        const slot = document.createElement('div');

        slot.className = 'puzzle-slot';
        slot.dataset.position = i;

        puzzleBoard.appendChild(slot);
        slots.push(slot);

        slot.addEventListener('click', () => {
            if (!selectedPiece) return;
            if (slot.querySelector('.puzzle-piece')) return;

            if (selectedPiece.parentElement === puzzleTray) {
                createPlaceholder(selectedPiece);
            }

            selectedPiece.classList.remove('selected');
            slot.appendChild(selectedPiece);
            selectedPiece = null;

            updateInstruction();
            checkCompletion();
        });
    }


    // --------------------------------------------------
    // GENERATE MATCHING JIGSAW EDGES
    // --------------------------------------------------

    const horizontalEdges = [];
    const verticalEdges = [];

    for (let row = 0; row <= SIZE; row++) {
        horizontalEdges[row] = [];

        for (let col = 0; col < SIZE; col++) {
            horizontalEdges[row][col] =
                row === 0 || row === SIZE
                    ? 0
                    : Math.random() < 0.5 ? 1 : -1;
        }
    }

    for (let row = 0; row < SIZE; row++) {
        verticalEdges[row] = [];

        for (let col = 0; col <= SIZE; col++) {
            verticalEdges[row][col] =
                col === 0 || col === SIZE
                    ? 0
                    : Math.random() < 0.5 ? 1 : -1;
        }
    }


    // --------------------------------------------------
    // CREATE JIGSAW SHAPE
    // --------------------------------------------------


	function createPiecePath(top, right, bottom, left) {
	    let path = 'M 10 10';

	    // TOP EDGE
	    path += ' L 52 10';

	    if (top !== 0) {
		const y = top === 1 ? 0 : 20;
		path += ` C 52 ${y} 52 ${y} 60 ${y}`;
		path += ` C 68 ${y} 68 ${y} 68 10`;
	    }

	    path += ' L 110 10';

	    // RIGHT EDGE
	    path += ' L 110 52';

	    if (right !== 0) {
		const x = right === 1 ? 120 : 100;
		path += ` C ${x} 52 ${x} 52 ${x} 60`;
		path += ` C ${x} 68 ${x} 68 110 68`;
	    }

	    path += ' L 110 110';

	    // BOTTOM EDGE
	    path += ' L 68 110';

	    if (bottom !== 0) {
		const y = bottom === 1 ? 120 : 100;
		path += ` C 68 ${y} 68 ${y} 60 ${y}`;
		path += ` C 52 ${y} 52 ${y} 52 110`;
	    }

	    path += ' L 10 110';

	    // LEFT EDGE
	    path += ' L 10 68';

	    if (left !== 0) {
		const x = left === 1 ? 0 : 20;
		path += ` C ${x} 68 ${x} 68 ${x} 60`;
		path += ` C ${x} 52 ${x} 52 10 52`;
	    }

	    path += ' Z';

	    return path;
	}
    

    // --------------------------------------------------
    // CREATE ALL 16 PIECES
    // --------------------------------------------------

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            const index = row * SIZE + col;

            const top = -horizontalEdges[row][col];
            const right = verticalEdges[row][col + 1];
            const bottom = horizontalEdges[row + 1][col];
            const left = -verticalEdges[row][col];

            const path = createPiecePath(top, right, bottom, left);
            const clipId = `puzzle-clip-${index}`;

            const piece = document.createElement('button');

            piece.type = 'button';
            piece.className = 'puzzle-piece';
            piece.dataset.piece = index;
            piece.setAttribute('aria-label', `Puzzle piece ${index + 1}`);

            piece.innerHTML = `
                <svg viewBox="0 0 120 120"
                     xmlns="http://www.w3.org/2000/svg">

                    <defs>
                        <clipPath id="${clipId}">
                            <path d="${path}"/>
                        </clipPath>
                    </defs>

                    <image
                        href="photos/lore.jpg"
                        x="${10 - col * 100}"
                        y="${10 - row * 100}"
                        width="400"
                        height="400"
                        preserveAspectRatio="none"
                        clip-path="url(#${clipId})"
                    />

                    <path
                        d="${path}"
                        fill="none"
                        stroke="rgba(255,255,255,0.85)"
                        stroke-width="1.5"
                    />
                </svg>
            `;

            pieces.push(piece);

            // Start dragging when the pointer goes down.
            piece.addEventListener('pointerdown', event => {
                if (event.button !== 0 && event.pointerType === 'mouse') {
                    return;
                }

                if (activeDrag) return;

                event.preventDefault();

                if (selectedPiece) {
                    selectedPiece.classList.remove('selected');
                    selectedPiece = null;
                }

                const rect = piece.getBoundingClientRect();

                activeDrag = {
                    piece,
                    origin: piece.parentElement,
                    placeholder: null,
                    startX: event.clientX,
                    startY: event.clientY,
                    offsetX: event.clientX - rect.left,
                    offsetY: event.clientY - rect.top,
                    width: rect.width,
                    height: rect.height,
                    moved: false,
                    pointerId: event.pointerId
                };
            });

            // Tap to select a piece.
            piece.addEventListener('click', event => {
                event.stopPropagation();

                if (Date.now() < suppressClickUntil) return;

                if (selectedPiece === piece) {
                    piece.classList.remove('selected');
                    selectedPiece = null;
                    return;
                }

                if (selectedPiece) {
                    selectedPiece.classList.remove('selected');
                }

                selectedPiece = piece;
                piece.classList.add('selected');
            });
        }
    }


    // --------------------------------------------------
    // SHUFFLE ONLY ON INITIAL LOAD
    // --------------------------------------------------

    const shuffledPieces = [...pieces];

    for (let i = shuffledPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffledPieces[i], shuffledPieces[j]] =
            [shuffledPieces[j], shuffledPieces[i]];
    }

    if (shuffledPieces.every((piece, i) =>
        Number(piece.dataset.piece) === i
    )) {
        shuffledPieces.reverse();
    }

    shuffledPieces.forEach(piece => {
        puzzleTray.appendChild(piece);
    });


    // --------------------------------------------------
    // DOCUMENT-LEVEL POINTER MOVEMENT
    // This keeps dragging working after reparenting.
    // --------------------------------------------------

    document.addEventListener('pointermove', event => {
        if (!activeDrag) return;
        if (event.pointerId !== activeDrag.pointerId) return;

        const drag = activeDrag;
        const piece = drag.piece;

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;

        // Ignore tiny pointer movements.
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;

        if (!drag.moved) {
            drag.moved = true;

            piece.classList.remove('selected');
            selectedPiece = null;

            // Leave a placeholder in the tray.
            if (drag.origin === puzzleTray) {
                drag.placeholder = createPlaceholder(piece);
            }

            // Move the actual piece to the document body.
            // The other tray pieces remain in their original positions.
            document.body.appendChild(piece);

            piece.style.position = 'fixed';
            piece.style.width = `${drag.width}px`;
            piece.style.height = `${drag.height}px`;
            piece.style.left = `${event.clientX - drag.offsetX}px`;
            piece.style.top = `${event.clientY - drag.offsetY}px`;
            piece.style.margin = '0';
            piece.style.zIndex = '99999';
            piece.style.transform = 'none';
            piece.style.pointerEvents = 'none';
            piece.style.touchAction = 'none';

        } else {
            piece.style.left =
                `${event.clientX - drag.offsetX}px`;

            piece.style.top =
                `${event.clientY - drag.offsetY}px`;
        }
    });


    // --------------------------------------------------
    // DOCUMENT-LEVEL POINTER RELEASE
    // --------------------------------------------------

    document.addEventListener('pointerup', event => {
        if (!activeDrag) return;
        if (event.pointerId !== activeDrag.pointerId) return;

        const drag = activeDrag;
        activeDrag = null;

        // A simple click, not a drag.
        if (!drag.moved) return;

        suppressClickUntil = Date.now() + 400;

        const piece = drag.piece;

        // Find the destination before resetting the piece.
        const target = document.elementFromPoint(
            event.clientX,
            event.clientY
        );

        const targetSlot = target?.closest('.puzzle-slot');
        const targetTray = target?.closest('.puzzle-tray');

        clearDragStyles(piece);

        // Drop into an empty board slot.
        if (
            targetSlot &&
            !targetSlot.querySelector('.puzzle-piece')
        ) {
            targetSlot.appendChild(piece);

            // Keep the original tray placeholder.
        }

        // Drop back into the tray.
        else if (targetTray) {
            if (drag.origin === puzzleTray) {
                restorePiece(drag);
            } else {
                puzzleTray.appendChild(piece);
            }
        }

        // Invalid drop: return to the original position.
        else {
            restorePiece(drag);
        }

        updateInstruction();
        checkCompletion();
    });


    // --------------------------------------------------
    // HANDLE CANCELLED DRAGS
    // --------------------------------------------------

    document.addEventListener('pointercancel', event => {
        if (!activeDrag) return;
        if (event.pointerId !== activeDrag.pointerId) return;

        const drag = activeDrag;
        activeDrag = null;

        restorePiece(drag);
    });


    // --------------------------------------------------
    // INSTRUCTIONS
    // --------------------------------------------------

    function updateInstruction() {
        if (!puzzleInstruction) return;

        const remaining = pieces.filter(piece =>
            piece.parentElement === puzzleTray
        ).length;

        puzzleInstruction.textContent = remaining === 0
            ? "Looking good... keep putting the pieces together ♡"
            : "Drag the pieces into place. They don't have to be in the right spot yet. ♡";
    }


    // --------------------------------------------------
    // CHECK COMPLETION
    // --------------------------------------------------

    function checkCompletion() {
        if (completed) return;

        const solved = slots.every((slot, index) => {
            const piece = slot.querySelector('.puzzle-piece');

            return piece &&
                Number(piece.dataset.piece) === index;
        });

        if (solved) {
            finishPuzzle();
        }
    }


    // --------------------------------------------------
    // FINISH PUZZLE
    // --------------------------------------------------

    function finishPuzzle() {
        completed = true;

        puzzleContainer.style.display = 'none';
        puzzleComplete.hidden = false;

        puzzleComplete.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }


    updateInstruction();
}

