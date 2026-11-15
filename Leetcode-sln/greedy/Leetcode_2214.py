class Solution:
    def minimumHealth(self, damage, armor):
        total = 0
        peak = 0
        shield_at = 0
        for i, hit in enumerate(damage):
            total += hit
            if hit > peak:
                peak = hit
                shield_at = i
        saved = min(peak, armor)
        return total - saved + 1
