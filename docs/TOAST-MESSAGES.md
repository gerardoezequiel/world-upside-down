# Toast Messages

Candidate messages for the map orientation system. Organised by category, ready for implementation in `src/orientation.ts` and `src/tools/share.ts`.

Current counts in production: 12 upside-down, 11 normal, 8 mirrored, 5 location (upside-down), 3 location (normal), 3 location (mirrored).

---

## 1. Upside-Down Toasts (South-Up)

Celebrating the flip. Mix of geographic fact, colonial critique, astronaut lore, flat-earth debunking, and southern hemisphere pride. Under 50 characters each.

```
"Ah, the correct way"
"Greenland just got honest"
"Australia finally on top"
"The ISS sees it this way"
"Nuestro norte es el Sur"
"Antarctica crowns the world"
"South is upstream on the Nile"
"Al-Idrisi had it right in 1154"
"NASA rotated the original photo"
"The Blue Marble was south-up"
"Sorry, Mercator"
"Flat earthers hate this one trick"
"Africa at its true scale"
"No astronaut has ever seen north"
"This is how satellites see it"
"Every compass points to a choice"
"McArthur got an F for this"
"500 years of habit, broken"
"The Southern Cross approves"
"Brazil is bigger than you think"
"Polaris is just a star"
"Stuart McArthur sends his regards"
"Buckminster Fuller nodded"
"Your geography teacher lied"
"The equator hasn't moved"
"Down Under? Under what?"
"South-up since 1154"
"90% of the world lives north"
"The Nile approves this message"
"Welcome to the correct hemisphere"
```

---

## 2. Normal Toasts (North-Up Return)

Gentle mockery for going back to the default. Playful disappointment, corporate blandness. Under 50 characters each.

```
"Okay, back to the default"
"How very atlas of you"
"The colonisers would be proud"
"Safe mode: enabled"
"Mercator thanks you"
"You chose the boring one"
"The school map wins again"
"Your teacher would approve"
"Comfort zone: restored"
"Corporate cartography activated"
"You had one job"
"The boardroom orientation"
"Back to the PowerPoint map"
"Autopilot engaged"
"Compliance mode: on"
"HR-approved orientation"
"You folded"
"Google Maps breathes a sigh"
"That's what they want you to see"
"Predictable, but okay"
```

---

## 3. Location-Specific Templates

Using `{city}` placeholder. Must land with any city name. Under 50 characters each.

### Upside-down (south-up)

```
"{city} from the other side"
"You just disoriented {city}"
"{city} has never looked like this"
"Try hailing a cab in {city} now"
"Lost in {city}? Good."
"{city}, but make it honest"
"New perspective on {city}"
"{city} looking brand new"
"The locals in {city} approve"
"{city} just got interesting"
```

### Normal (north-up)

```
"{city} snaps back to boring"
"Back to the tourist map of {city}"
"{city}: the postcard version"
"The {city} your GPS expects"
"{city} on autopilot again"
```

### Mirrored (east-west)

```
"{city}: mirror edition"
"Finding your way in {city}? No."
"{city} through the looking glass"
"Every turn in {city} is wrong now"
"{city} in reverse"
```

---

## 4. Mirrored Toasts (East-West Flip)

Mirror, backwards, left-right confusion. Under 50 characters each.

```
"Read this backwards"
"Your left is now your right"
"Ambulance mode"
"Leonardo would feel at home"
"East and west just swapped"
"Try parallel parking now"
"Every sat-nav just died"
"This is how mirrors see maps"
"Left turn means right turn"
"The world as a palindrome"
```

---

## 5. Poster / Zine Messages

Not toasts. Protest-poster style for a future risograph print or bold overlay feature. ALL CAPS, punchy, counter-cartography energy.

```
NORTH IS A LIE
WHO DECIDED UP?
YOU'VE BEEN HOLDING THE MAP WRONG
SOUTH WAS FIRST
THE GLOBE HAS NO TOP
EVERY MAP IS A POLITICAL ACT
THERE IS NO UP IN SPACE
ORIENTATION IS IDEOLOGY
500 YEARS OF NORTH IS ENOUGH
ROTATE EVERYTHING
```

---

## 6. Share Text Variants

For WhatsApp, Instagram stories, X/Twitter. Must include `{city}` placeholder and a hook that makes the recipient tap. Under 100 characters each.

```
"I flipped {city} upside down. Turns out NASA did it first."
"{city} looks completely different south-up. Try it."
"You've been looking at {city} wrong your whole life."
"I broke {city}. Or maybe the map was already broken."
"The world upside down, starting with {city}. You won't unsee it."
```

---

## Implementation Notes

- Toast display duration is 2200ms (see `showFlipToast` in `src/orientation.ts`). Messages must register in under 2 seconds of reading.
- Location toasts trigger 40% of the time when a city is detected (see `getOrientationToast`). Keep them slightly longer; users are already engaged.
- Share texts should work without the emoji suffix currently appended in `src/tools/share.ts`. Test both with and without.
- Poster messages are not for the toast system. Future use: full-screen overlay during poster mode, risograph-printed merchandise, or zine PDF export.
- All messages should be reviewed for character count in the actual toast UI. Some may truncate on narrow mobile screens; prioritise messages under 40 characters for the rotation that the mobile FAB triggers (upside-down and normal only; mirrored is desktop-only via keyboard).
