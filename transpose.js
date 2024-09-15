
distanceHalfSteps = new Map();
distanceHalfSteps.set(1, ['B#','C']);
distanceHalfSteps.set(2, ['C#','Db']);
distanceHalfSteps.set(3, ['D']);
distanceHalfSteps.set(4, ['D#','Eb']);
distanceHalfSteps.set(5, ['E','Fb']);
distanceHalfSteps.set(6, ['E#','F']);
distanceHalfSteps.set(7, ['F#','Gb']);
distanceHalfSteps.set(8, ['G']);
distanceHalfSteps.set(9, ['G#','Ab']);
distanceHalfSteps.set(10, ['A']);
distanceHalfSteps.set(11, ['A#','Bb']);
distanceHalfSteps.set(12, ['B','Cb']);

function transpose(origKey, finalKey, origSequence) {
    // get distance in half steps from start to end
    const origInd = [...distanceHalfSteps.entries()]
        .find(([key, value]) => value.includes(origKey))[0];
    const finalInd = [...distanceHalfSteps.entries()]
        .find(([key, value]) => value.includes(finalKey))[0];
    const distance = finalInd - origInd;

    console.log(`original index: ${origInd}, final index: ${finalInd} --- distance: ${distance}`);

    let origScale = [];
    let finalScale = [];

    // we are assuming major, but if the song is in a minor key, this would still work (minor chords would just be treated as nondiatonic)
    // build start key scale (integer steps only)
    // first one is easy
    origScale.push(origKey);
    // second is 2 half steps up
    origScale.push(calculateScaleNote(origInd, origScale[0], 0, 2));
    // third is 4 half steps up
    origScale.push(calculateScaleNote(origInd, origScale[1], 0, 4));
    // fourth is 5 half steps up
    origScale.push(calculateScaleNote(origInd, origScale[2], 0, 5));
    // fifth is 7 half steps up
    origScale.push(calculateScaleNote(origInd, origScale[3], 0, 7));
    // sixth is 9 half steps up
    origScale.push(calculateScaleNote(origInd, origScale[4], 0, 9));
    // seventh is 11 half steps up
    origScale.push(calculateScaleNote(origInd, origScale[5], 0, 11));

    // build end key scale (integer steps only)
    // first one is easy
    finalScale.push(finalKey);
    // second is 2 half steps up
    finalScale.push(calculateScaleNote(origInd, finalScale[0], distance, 2));
    // third is 4 half steps up
    finalScale.push(calculateScaleNote(origInd, finalScale[1], distance, 4));
    // fourth is 5 half steps up
    finalScale.push(calculateScaleNote(origInd, finalScale[2], distance, 5));
    // fifth is 7 half steps up
    finalScale.push(calculateScaleNote(origInd, finalScale[3], distance, 7));
    // sixth is 9 half steps up
    finalScale.push(calculateScaleNote(origInd, finalScale[4], distance, 9));
    // seventh is 11 half steps up
    finalScale.push(calculateScaleNote(origInd, finalScale[5], distance, 11));

    console.log('final scale: ' + finalScale);

    // populate the final sequence of chords
    let finalSequence = [];
    // loop through original sequence of chords
    for (let i = 0; i < origSequence.length; i++) {
        const origNote = origSequence[i];
        
        // if this is a diatonic note
        if (origScale.includes(origNote)) {
            const index = origScale.indexOf(origNote);
            finalSequence.push(finalScale[index]);
        }
        // if this is a nondiatonic note (not within scale)
        else {
            console.log(`--- NONDIATONIC NOTE DETECTED - ${origNote} ---`);
            
            // find the note in the new scale with the same base note
            const origNoteWithoutAccidentals = origNote.split('#')[0].split('b')[0];
            let origNoteWithSameBase = '';
            let finalNoteWithSameBase = '';
            for (let x = 0; x < origScale.length; x++) {
                const startScaleBase = origScale[x].split('#')[0].split('b')[0];
                if (startScaleBase === origNoteWithoutAccidentals) {
                    origNoteWithSameBase = origScale[x];
                    finalNoteWithSameBase = finalScale[x];
                    break;
                }
            }

            // calculate whether we are #ing or bing the base note:
            // compare the original nondiatonic note with the diatonic note in the 
            // original scale that has the same base
            console.log(`origNote: ${origNote}`);
            console.log(`origNoteWithSameBase: ${origNoteWithSameBase}`);
            console.log(`finalNoteWithSameBase: ${finalNoteWithSameBase}`);

            if ((origNoteWithSameBase.includes('#') && !origNote.includes('#')) || (!origNoteWithSameBase.includes('b') && origNote.includes('b'))) {
                // this means we are flatting the diatonic note
                if (finalNoteWithSameBase.includes('#')) {
                    finalSequence.push(finalNoteWithSameBase.split('#')[0]);
                }
                else {
                    finalSequence.push(finalNoteWithSameBase + 'b');
                }
            }
            else if ((!origNoteWithSameBase.includes('#') && origNote.includes('#')) || (origNoteWithSameBase.includes('b') && !origNote.includes('b'))) {
                // this means we are sharping the diatonic note
                if (finalNoteWithSameBase.includes('b')) {
                    finalSequence.push(finalNoteWithSameBase.split('b')[0]);
                }
                else {
                    finalSequence.push(finalNoteWithSameBase + '#');
                }
            }
            else {
                // error case, shouldn't reach here
                finalSequence.push('');
            }
        }
    }

    console.log(finalSequence);

}

function calculateScaleNote(origInd, previousNote, distance, interval) {
    // console.log('BEGIN CALC NEW NOTE');
    
    let endNoteInd = origInd + distance + interval;
    if (endNoteInd > 12) {
        endNoteInd = endNoteInd % 12;
    }

    const possibleNotes = distanceHalfSteps.get(endNoteInd);
    // console.log(`possible notes for interval ${interval}: ${possibleNotes}`);

    if (possibleNotes.length === 1) {
        return possibleNotes[0];
    }
    else {
        // strip previous note of accidentals
        if (previousNote.includes('#')) {
            previousNote = previousNote.split('#')[0];
        }
        if (previousNote.includes('b')) {
            previousNote = previousNote.split('b')[0];
        }
        // console.log(`previous note: ${previousNote}`);
        
        // determine which of the possible notes we should use
        // the first note in possibleNotes should be either # or natural
        let possibleBase = possibleNotes[0].split('#')[0];
        if (possibleBase !== previousNote) {
            return possibleNotes[0];
        }
        else {
            return possibleNotes[1];
        }
    }
}

transpose('D','G',['D','A','B','G','C','G','A','F','Eb','Bb','C','Ab','E','B','C#','A']);
        