# 3947 · Maximum Number of Items From Sale II

The visualization executes its displayed Python source through the bundled
WebAssembly runtime. The external source pane and existing line controls remain
the debugger; the scene contains pictures, counters and arithmetic only.
Input retains the `factor,price; …` format and separate budget field.

Each paid copy earns at most one other item. A valid ordered pair has different
type IDs and a divisible target factor, and can be used only once. A multiples
sieve counts matching types, including the source; subtracting one gives its
number of gift-bearing slots. Each such slot produces two copies. Sort by price,
buy slots while they cost less than two cheapest regular copies, then use the
remaining budget for the cheapest item. Price ties are resolved by limit and
original ID. The algorithm uses O(n log n + M log M) time and O(n + M) space.

Pictures show actual frequency cells, multiples, slot counts, sorted groups,
eligible gifts, paid copies, gift pairs and the wallet balance. Generic gift
icons have a question mark until a target is chosen. Snapshot annotations assign
distinct eligible targets to the source's actual `take` count. Counting copies
and deducting their payment are separate source statements; a pending badge
marks the intermediate frame. Gifts do not earn further gifts.

Both Vietnamese / US English and light / dark themes are supported. The mobile
slot order wraps into a grid. Copy quantities use grouped icons rather than
allocating a billion DOM elements. The teaching replay accepts 1–24 item types,
factors in [1,n], and integer prices / budget in [1,10⁹].

Validation: `node --test tests/sale-items-3947.test.js` checks 6,544 independent
exhaustive purchase-count optima, official examples, duplicate factors, price
ties, exact two-copy thresholds, small budgets, a billion-budget replay,
ordered-pair uniqueness, intermediate accounting, reversible bilingual pictures,
and lazy asset registration. Browser QA covers external line controls, phase
jumps, both themes / languages and 390px layouts including 24 types.
