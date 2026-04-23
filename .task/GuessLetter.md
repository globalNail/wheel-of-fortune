# 🧩 TASK: Guess Letter

## 🎯 Objective
Allow current team to guess a consonant and update phrase + score.

---

## 📥 Input
POST /game/guess

{
  sessionCode: "ABC123",
  letter: "T"
}

---

## 📤 Expected Output
- If correct:
  - Reveal letters
  - Increase score
- If wrong:
  - Move to next team

---

## 📏 Constraints

- Letter must not be guessed before
- Must be consonant
- Only current team allowed

---

## 🔄 Flow

1. Validate turn
2. Check letter not guessed
3. Check if letter exists in phrase
4. If correct:
   - count occurrences
   - score += wheelValue * count
   - update masked phrase
5. Else:
   - switch turn
6. Emit:
   - onPhraseUpdate
   - onScoreUpdate
   - onTurnChange

---

## 🧪 Validation Checklist

- [ ] Correct letter reveals all occurrences
- [ ] Score calculated correctly
- [ ] Wrong guess switches turn