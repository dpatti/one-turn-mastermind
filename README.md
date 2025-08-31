# One Turn Mastermind

Given a Mastermind board that has eliminated all possible options except one,
can you deduce the solution from the clues? You get one chance. No guessing
required!

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
