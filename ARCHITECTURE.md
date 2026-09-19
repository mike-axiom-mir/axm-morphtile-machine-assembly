# Architecture

src/index.js reads explicit packets, clones accepted data, and never imports or writes sibling repositories.

Dependency direction is one-way: this machine may consume MorphTile's public contract; MorphTile core must never import this machine. Candidate output is data, not canon. There is no shared protocol package in this pass: the local envelope copy may only be extracted after multiple real machines prove a stable common contract.

Repository isolation rules: no sibling imports, no sibling writes, no shared mutable state, no assumed installed machines, and no cloud dependency for the tested path.

