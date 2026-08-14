import heapq
from collections import defaultdict


class Twitter:
    def __init__(self):
        self.count = 0                    # global timestamp (decreasing → max-heap)
        self.tweets = defaultdict(list)   # userId -> [(timestamp, tweetId)]
        self.following = defaultdict(set) # userId -> {followeeId}

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweets[userId].append((self.count, tweetId))
        self.count -= 1  # decrement so smaller value = more recent

    def getNewsFeed(self, userId: int) -> list:
        # Collect the last 10 tweets from userId and all followees
        heap = []
        followees = self.following[userId] | {userId}

        for uid in followees:
            tweets = self.tweets[uid]
            if tweets:
                # Start from the most recent (last in list)
                idx = len(tweets) - 1
                timestamp, tweetId = tweets[idx]
                heapq.heappush(heap, (timestamp, tweetId, uid, idx))

        result = []
        while heap and len(result) < 10:
            timestamp, tweetId, uid, idx = heapq.heappop(heap)
            result.append(tweetId)
            if idx > 0:
                # Push the next most recent tweet from the same user
                idx -= 1
                next_ts, next_tid = self.tweets[uid][idx]
                heapq.heappush(heap, (next_ts, next_tid, uid, idx))

        return result

    def follow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)


# Example usage
twitter = Twitter()
twitter.postTweet(1, 5)        # User 1 posts tweet 5
twitter.postTweet(1, 3)        # User 1 posts tweet 3
twitter.postTweet(2, 6)        # User 2 posts tweet 6
twitter.follow(1, 2)           # User 1 follows user 2
print(twitter.getNewsFeed(1))  # [3, 6, 5] — most recent first
twitter.unfollow(1, 2)         # User 1 unfollows user 2
print(twitter.getNewsFeed(1))  # [3, 5] — no longer sees user 2's tweets
