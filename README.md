# One Turn Mastermind

Given a Mastermind board that has eliminated all possible options except one,
can you deduce the solution from the clues? You get one chance. No guessing
required!

[Play](https://dpatti.github.io/one-turn-mastermind/)

## Hints

* It can be hard to figure out colors *and* positions together. Try starting by
  just figuring out which colors are in the set, and from there try to get their
  positions.
* Don't forget about negative information: a row that gets few or no black/white
  pegs tells you a lot.
* Look for rows that changed slightly (one or two slots) and see if you can
  extract information from there. Two slots changing with no change in
  black/white pegs can give you some information about the relationship of those
  two.
* Sometimes you can figure out a slot by eliminating all options except one. The
  advanced input mode includes checkboxes for tracking purposes.

## History

This is a game idea I had while reading [Optimal Mastermind][1], which has a toy
mastermind implementation with a suggestion for the move that would provide the
most bits of information. On my first attempt, I got really lucky and randomly
got it on my third turn. Then I tried again and it exhausted everything except
one option for the final move. I spent some time looking at the solved board and
trying to figure out if I could have intuited the last turn myself. It was an
interesting logic puzzle! And then I figured why not make it a game? Or really,
why not use this as an excuse to try Claude Code and have it make me a game
while I promise not to judge the implementation.

Each commit contains a reproduction of the prompts I gave it. I constructed them
manually and painstakingly. I don't know if there's a better way to do it.

[1]: https://www.goranssongaspar.com/mastermind
