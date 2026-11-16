class Solution:
    def maxTotalReward(self, rewardValues):
        rewards = sorted(set(rewardValues))
        bits = 1
        for reward in rewards:
            eligible = bits & ((1 << reward) - 1)
            shifted = eligible << reward
            bits |= shifted
        return bits.bit_length() - 1
