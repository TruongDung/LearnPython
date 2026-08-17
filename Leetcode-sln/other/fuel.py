"""Calculate the maximum forward distance using fuel deposits."""

from typing import List, Tuple


def max_distance(deposits: List[Tuple[int, int]], start: int) -> int:
    """Return how far a vehicle can travel from the selected deposit."""
    start_position = deposits[start][0]
    position = start_position
    fuel = deposits[start][1]

    for next_position, fuel_amount in deposits[start + 1:]:
        gap = next_position - position
        if fuel < gap:
            return position + fuel - start_position

        fuel -= gap
        position = next_position
        fuel += fuel_amount

    return position + fuel - start_position
