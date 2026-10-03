const PRIMARY_VISUALIZATION_SURFACES = ["bars", "treeView", "gridView", "bfsGridView", "liveVarsView"];

function setPrimaryVisualizationSurface(visibleSurface) {
  PRIMARY_VISUALIZATION_SURFACES.forEach((surface) => {
    $(surface).classList.toggle("hidden", surface !== visibleSurface);
  });
}

const ORDERED_RENDERER_REGISTRY = [
    { predicate: (step) => Boolean(step.__live), surface: "liveVarsView", render: (step) => {
      renderLiveVarsView(step);
    } },
    { predicate: (step) => Boolean(step.infiniteSet2336View), surface: "treeView", render: (step) => {
      renderInfiniteSet2336View(step);
    } },
    { predicate: (step) => Boolean(step.hardProblemView), surface: "treeView", render: (step) => {
      renderHardProblemView(step);
    } },
    { predicate: (step) => Boolean(step.xMatrix2319View), surface: "treeView", render: (step) => {
      renderXMatrix2319View(step);
    } },
    { predicate: (step) => Boolean(step.parentheses1111View), surface: "treeView", render: (step) => {
      renderParentheses1111View(step);
    } },
    { predicate: (step) => Boolean(step.reverseParen1190View), surface: "treeView", render: (step) => {
      renderReverseParen1190View(step);
    } },
    { predicate: (step) => Boolean(step.calendar731View), surface: "treeView", render: (step) => {
      renderCalendar731View(step);
    } },
    { predicate: (step) => Boolean(step.calendar729View), surface: "treeView", render: (step) => {
      renderCalendar729View(step);
    } },
    { predicate: (step) => Boolean(step.rangeModuleView), surface: "treeView", render: (step) => {
      renderRangeModuleView(step);
    } },
    { predicate: (step) => Boolean(step.calendarView), surface: "treeView", render: (step) => {
      renderCalendarView(step);
    } },
    { predicate: (step) => Boolean(step.goodSubseqView), surface: "treeView", render: (step) => {
      renderGoodSubseqView(step);
    } },
    { predicate: (step) => Boolean(step.nextPermutationView), surface: "treeView", render: (step) => {
      renderNextPermutation31View(step);
    } },
    { predicate: (step) => Boolean(step.permutation46View), surface: "treeView", render: (step) => {
      renderPermutation46View(step);
    } },
    { predicate: (step) => Boolean(step.lexPermutationView), surface: "treeView", render: (step) => {
      renderLexPermutation3720View(step);
    } },
    { predicate: (step) => Boolean(step.palindrome3734View), surface: "treeView", render: (step) => {
      renderPalindromicPermutation3734View(step);
    } },
    { predicate: (step) => Boolean(step.ticketsView), surface: "treeView", render: (step) => {
      renderTicketsView(step);
    } },
    { predicate: (step) => Boolean(step.stockCooldownView), surface: "treeView", render: (step) => {
      renderStockCooldownView(step);
    } },
    { predicate: (step) => Boolean(step.maximalSquareView), surface: "treeView", render: (step) => {
      renderMaximalSquareView(step);
    } },
    { predicate: (step) => Boolean(step.numberOfLISView), surface: "treeView", render: (step) => {
      renderNumberOfLISView(step);
    } },
    { predicate: (step) => Boolean(step.lis2407View), surface: "treeView", render: (step) => {
      renderLIS2407View(step);
    } },
    { predicate: (step) => Boolean(step.wordLadder126View), surface: "treeView", render: (step) => {
      renderWordLadder126View(step);
    } },
    { predicate: (step) => Boolean(step.houseRobberView), surface: "treeView", render: (step) => {
      renderHouseRobberView(step);
    } },
    { predicate: (step) => Boolean(step.minCostStairsView), surface: "treeView", render: (step) => {
      renderMinCostStairsView(step);
    } },
    { predicate: (step) => Boolean(step.twoEvents2054View), surface: "treeView", render: (step) => {
      renderTwoEvents2054View(step);
    } },
    { predicate: (step) => Boolean(step.weightedIntervals3414View), surface: "treeView", render: (step) => {
      renderWeightedIntervals3414View(step);
    } },
    { predicate: (step) => Boolean(step.advancedBitmaskView), surface: "treeView", render: (step) => {
      renderAdvancedBitmaskView(step);
    } },
    { predicate: (step) => Boolean(step.bitmaskBasicsView), surface: "treeView", render: (step) => {
      renderBitmaskBasicsView(step);
    } },
    { predicate: (step) => Boolean(step.countBitsView), surface: "treeView", render: (step) => {
      renderCountBitsView(step);
    } },
    { predicate: (step) => Boolean(step.wordBreakView), surface: "treeView", render: (step) => {
      renderWordBreakView(step);
    } },
    { predicate: (step) => Boolean(step.cinemaSeatView), surface: "treeView", render: (step) => {
      renderCinemaSeatView(step);
    } },
    { predicate: (step) => Boolean(step.coinChangeView), surface: "treeView", render: (step) => {
      renderCoinChangeView(step);
    } },
    { predicate: (step) => Boolean(step.missingNumberView), surface: "treeView", render: (step) => {
      renderMissingNumberView(step);
    } },
    { predicate: (step) => Boolean(step.almostMissingView), surface: "treeView", render: (step) => {
      renderAlmostMissingView(step);
    } },
    { predicate: (step) => Boolean(step.pascalTriangleView), surface: "treeView", render: (step) => {
      renderPascalTriangleView(step);
    } },
    { predicate: (step) => Boolean(step.fibonacciView), surface: "treeView", render: (step) => {
      renderFibonacciView(step);
    } },
    { predicate: (step) => Boolean(step.tribonacciView), surface: "treeView", render: (step) => {
      renderTribonacciView(step);
    } },
    { predicate: (step) => Boolean(step.climbingStairsView), surface: "treeView", render: (step) => {
      renderClimbingStairsView(step);
    } },
    { predicate: (step) => Boolean(step.mapSumView), surface: "treeView", render: (step) => {
      renderMapSumView(step);
    } },
    { predicate: (step) => Boolean(step.longestDupView), surface: "treeView", render: (step) => {
      renderLongestDuplicateView(step);
    } },
    { predicate: (step) => Boolean(step.clearStarsView), surface: "treeView", render: (step) => {
      renderClearStarsView(step);
    } },
    { predicate: (step) => Boolean(step.validSequenceView), surface: "treeView", render: (step) => {
      renderValidSequenceView(step);
    } },
    { predicate: (step) => Boolean(step.prefixAverageView), surface: "treeView", render: (step) => {
      renderPrefixAverageView(step);
    } },
    { predicate: (step) => Boolean(step.replaceGreatestView), surface: "treeView", render: (step) => {
      renderReplaceGreatestView(step);
    } },
    { predicate: (step) => Boolean(step.mountainArrayView), surface: "treeView", render: (step) => {
      renderMountainArrayView(step);
    } },
    { predicate: (step) => Boolean(step.houses2320View), surface: "treeView", render: (step) => {
      renderHouses2320View(step);
    } },
    { predicate: (step) => Boolean(step.stoneGame1690View), surface: "treeView", render: (step) => {
      renderStoneGame1690View(step);
    } },
    { predicate: (step) => Boolean(step.pizza1388View), surface: "treeView", render: (step) => {
      renderPizza1388View(step);
    } },
    { predicate: (step) => Boolean(step.brainpower2140View), surface: "treeView", render: (step) => {
      renderBrainpower2140View(step);
    } },
    { predicate: (step) => Boolean(step.deleteEarn740View), surface: "treeView", render: (step) => {
      renderDeleteEarn740View(step);
    } },
    { predicate: (step) => Boolean(step.maxProductView), surface: "treeView", render: (step) => {
      renderMaximumProductView(step);
    } },
    { predicate: (step) => Boolean(step.productSubarrayView), surface: "treeView", render: (step) => {
      renderProductSubarrayView(step);
    } },
    { predicate: (step) => Boolean(step.minimumSubarrayView), surface: "treeView", render: (step) => {
      renderMinimumSubarrayView(step);
    } },
    { predicate: (step) => Boolean(step.twoSubarrays1477View), surface: "treeView", render: (step) => {
      renderTwoSubarrays1477View(step);
    } },
    { predicate: (step) => Boolean(step.averageWindowView), surface: "treeView", render: (step) => {
      renderAverageWindowView(step);
    } },
    { predicate: (step) => Boolean(step.rectangleSweepView), surface: "treeView", render: (step) => {
      renderRectangleSweepView(step);
    } },
    { predicate: (step) => Boolean(step.kruskalEffortView), surface: "treeView", render: (step) => {
      renderKruskalEffortView(step);
    } },
    { predicate: (step) => Boolean(step.waterDistributionView), surface: "treeView", render: (step) => {
      renderWaterDistributionView(step);
    } },
    { predicate: (step) => Boolean(step.connectCitiesView), surface: "treeView", render: (step) => {
      renderConnectCitiesView(step);
    } },
    { predicate: (step) => Boolean(step.bricks803View), surface: "treeView", render: (step) => {
      renderBricks803View(step);
    } },
    { predicate: (step) => Boolean(step.malware928View), surface: "treeView", render: (step) => {
      renderMalware928View(step);
    } },
    { predicate: (step) => Boolean(step.malware924View), surface: "treeView", render: (step) => {
      renderMalware924View(step);
    } },
    { predicate: (step) => Boolean(step.countPairs2316View), surface: "treeView", render: (step) => {
      renderCountPairs2316View(step);
    } },
    { predicate: (step) => Boolean(step.equalityEquationsView), surface: "treeView", render: (step) => {
      renderEqualityEquationsView(step);
    } },
    { predicate: (step) => Boolean(step.multiplesIeView), surface: "treeView", render: (step) => {
      renderMultiplesIeView(step);
    } },
    { predicate: (step) => Boolean(step.stones947View), surface: "treeView", render: (step) => {
      renderStones947View(step);
    } },
    { predicate: (step) => Boolean(step.equivalent1061View), surface: "treeView", render: (step) => {
      renderEquivalent1061View(step);
    } },
    { predicate: (step) => Boolean(step.islands305View), surface: "treeView", render: (step) => {
      renderIslands305View(step);
    } },
    { predicate: (step) => Boolean(step.parallelCoursesView), surface: "treeView", render: (step) => {
      renderParallelCoursesView(step);
    } },
    { predicate: (step) => Boolean(step.loudRichView || step.loudRichV2), surface: "treeView", render: (step) => {
      renderLoudRichView(step);
    } },
    { predicate: (step) => Boolean(step.lruCacheView), surface: "treeView", render: (step) => {
      renderLruCacheView(step);
    } },
    { predicate: (step) => Boolean(step.lfuCacheView), surface: "treeView", render: (step) => {
      renderLfuCacheView(step);
    } },
    { predicate: (step) => Boolean(step.musicPlayerView), surface: "treeView", render: (step) => {
      renderMusicPlayerView(step);
    } },
    { predicate: (step) => Boolean(step.rideSharingView), surface: "treeView", render: (step) => {
      renderRideSharingView(step);
    } },
    { predicate: (step) => Boolean(step.kthPalindromeView), surface: "treeView", render: (step) => {
      renderKthPalindromeView(step);
    } },
    { predicate: (step) => Boolean(step.palindromeBuildView), surface: "treeView", render: (step) => {
      renderPalindromeBuildView(step);
    } },
    { predicate: (step) => Boolean(step.occurrenceLookupView), surface: "treeView", render: (step) => {
      renderOccurrenceLookupView(step);
    } },
    { predicate: (step) => Boolean(step.duplicateZerosView), surface: "treeView", render: (step) => {
      renderDuplicateZerosView(step);
    } },
    { predicate: (step) => Boolean(step.gcdPairsView), surface: "treeView", render: (step) => {
      renderGcdPairsView(step);
    } },
    { predicate: (step) => Boolean(step.rotateArray189View), surface: "treeView", render: (step) => {
      renderRotateArray189View(step);
    } },
    { predicate: (step) => Boolean(step.rotatedSearch81View), surface: "treeView", render: (step) => {
      renderRotatedSearch81View(step);
    } },
    { predicate: (step) => Boolean(step.rotatedSearchView), surface: "treeView", render: (step) => {
      renderRotatedSearchView(step);
    } },
    { predicate: (step) => Boolean(step.findMinRotatedView), surface: "treeView", render: (step) => {
      renderFindMinRotatedView(step);
    } },
    { predicate: (step) => Boolean(step.twitterView), surface: "treeView", render: (step) => {
      renderTwitterView(step);
    } },
    { predicate: (step) => Boolean(step.matrix542View), surface: "treeView", render: (step) => {
      renderMatrix542View(step);
    } },
    { predicate: (step) => Boolean(step.unionFind684View), surface: "treeView", render: (step) => {
      renderUnionFind684View(step);
    } },
    { predicate: (step) => Boolean(step.generateParentheses22View), surface: "treeView", render: (step) => {
      renderGenerateParentheses22View(step);
    } },
    { predicate: (step) => Boolean(step.flights787View), surface: "treeView", render: (step) => {
      renderFlights787View(step);
    } },
    { predicate: (step) => Boolean(step.visitAll847View), surface: "treeView", render: (step) => {
      renderVisitAll847View(step);
    } },
    { predicate: (step) => Boolean(step.coins2218View), surface: "treeView", render: (step) => {
      renderCoins2218View(step);
    } },
    { predicate: (step) => Boolean(step.bfs9006View), surface: "treeView", render: (step) => {
      renderBfs9006View(step);
    } },
    { predicate: (step) => Boolean(step.profitTrackerView), surface: "treeView", render: (step) => {
      renderProfitTracker9001View(step);
    } },
    { predicate: (step) => Boolean(step.square9013View), surface: "treeView", render: (step) => {
      renderSquare9013View(step);
    } },
    { predicate: (step) => Boolean(step.loyal9014View), surface: "treeView", render: (step) => {
      renderLoyal9014View(step);
    } },
    { predicate: (step) => Boolean(step.sweep9015View), surface: "treeView", render: (step) => {
      renderSweep9015View(step);
    } },
    { predicate: (step) => Boolean(step.friends9016View), surface: "treeView", render: (step) => {
      renderFriends9016View(step);
    } },
    { predicate: (step) => Boolean(step.ads9017View), surface: "treeView", render: (step) => {
      renderAds9017View(step);
    } },
    { predicate: (step) => Boolean(step.cyclicSortView), surface: "treeView", render: (step) => {
      renderCyclicSortView(step);
    } },
    { predicate: (step) => Boolean(step.mergeIntervalsView), surface: "treeView", render: (step) => {
      renderMergeIntervalsView(step);
    } },
    { predicate: (step) => Boolean(step.meetingRoomsTimelineView), surface: "treeView", render: (step) => {
      renderMeetingRoomsTimelineView(step);
    } },
    { predicate: (step) => Boolean(step.pairChainView), surface: "treeView", render: (step) => {
      renderPairChainView(step);
    } },
    { predicate: (step) => Boolean(step.meetingTimelineView), surface: "treeView", render: (step) => {
      renderMeetingTimelineView(step);
    } },
    { predicate: (step) => Boolean(step.skylineView), surface: "treeView", render: (step) => {
      renderSkylineView(step);
    } },
    { predicate: (step) => Boolean(step.bfsLevelView), surface: "treeView", render: (step) => {
      renderBfsLevelView(step);
    } },
    { predicate: (step) => Boolean(step.pathSumIIIView), surface: "treeView", render: (step) => {
      renderPathSumIIIView(step);
    } },
    { predicate: (step) => Boolean(step.rootLeafNumber129View), surface: "treeView", render: (step) => {
      renderRootLeafNumber129View(step);
    } },
    { predicate: (step) => Boolean(step.smallestLeaf988View), surface: "treeView", render: (step) => {
      renderSmallestLeaf988View(step);
    } },
    { predicate: (step) => Boolean(step.pseudoPalindrome1457View), surface: "treeView", render: (step) => {
      renderPseudoPalindrome1457View(step);
    } },
    { predicate: (step) => Boolean(step.univaluePath687View), surface: "treeView", render: (step) => {
      renderUnivaluePath687View(step);
    } },
    { predicate: (step) => Boolean(step.zigzag1372View), surface: "treeView", render: (step) => {
      renderLongestZigzag1372View(step);
    } },
    { predicate: (step) => Boolean(step.lca236View), surface: "treeView", render: (step) => {
      renderLca236View(step);
    } },
    { predicate: (step) => Boolean(step.directions2096View), surface: "treeView", render: (step) => {
      renderDirections2096View(step);
    } },
    { predicate: (step) => Boolean(step.reverseDegree3498View), surface: "treeView", render: (step) => {
      renderReverseDegree3498View(step);
    } },
    { predicate: (step) => Boolean(step.findXValue3524View), surface: "treeView", render: (step) => {
      renderFindXValue3524View(step);
    } },
    { predicate: (step) => Boolean(step.minWindow76View), surface: "treeView", render: (step) => {
      renderMinWindow76View(step);
    } },
    { predicate: (step) => Boolean(step.findXValue3525View), surface: "treeView", render: (step) => {
      renderFindXValue3525View(step);
    } },
    { predicate: (step) => Boolean(step.treeEssentialsView), surface: "treeView", render: (step) => {
      renderTreeEssentialsView(step);
    } },
    { predicate: (step) => Boolean(step.sameTreeView), surface: "treeView", render: (step) => {
      renderSameTreeView(step);
    } },
    { predicate: (step) => Boolean(step.sortedListBstView), surface: "treeView", render: (step) => {
      renderSortedListBstView(step);
    } },
    { predicate: (step) => Boolean(step.recoverBstView), surface: "treeView", render: (step) => {
      renderRecoverBstView(step);
    } },
    { predicate: (step) => Boolean(step.wordSearchIIView), surface: "treeView", render: (step) => {
      renderWordSearchIIView(step);
    } },
    { predicate: (step) => Boolean(step.wordSearchView), surface: "treeView", render: (step) => {
      renderWordSearchView(step);
    } },
    { predicate: (step) => Boolean(step.keypadPushView), surface: "treeView", render: (step) => {
      renderKeypadPushView(step);
    } },
    { predicate: (step) => Boolean(step.keypadHeapView), surface: "treeView", render: (step) => {
      renderKeypadHeapView(step);
    } },
    { predicate: (step) => Boolean(step.stoneGameIIView), surface: "treeView", render: (step) => {
      renderStoneGameIIView(step);
    } },
    { predicate: (step) => Boolean(step.stoneGameIVView), surface: "treeView", render: (step) => {
      renderStoneGameIVView(step);
    } },
    { predicate: (step) => Boolean(step.stoneGameView), surface: "treeView", render: (step) => {
      renderStoneGameView(step);
    } },
    { predicate: (step) => Boolean(step.predictWinnerView), surface: "treeView", render: (step) => {
      renderPredictWinnerView(step);
    } },
    { predicate: (step) => Boolean(step.rectangleAreaView), surface: "treeView", render: (step) => {
      renderRectangleAreaView(step);
    } },
    { predicate: (step) => Boolean(step.buildingBoxesView), surface: "treeView", render: (step) => {
      renderBuildingBoxesView(step);
    } },
    { predicate: (step) => Boolean(step.networkDelayView), surface: "treeView", render: (step) => {
      renderNetworkDelayView(step);
    } },
    { predicate: (step) => Boolean(step.reachable882View), surface: "treeView", render: (step) => {
      renderReachable882View(step);
    } },
    { predicate: (step) => Boolean(step.maze499View), surface: "treeView", render: (step) => {
      renderMaze499View(step);
    } },
    { predicate: (step) => Boolean(step.restricted1786View), surface: "treeView", render: (step) => {
      renderRestricted1786View(step);
    } },
    { predicate: (step) => Boolean(step.multiDijkstra2203View), surface: "treeView", render: (step) => {
      renderMultiDijkstra2203View(step);
    } },
    { predicate: (step) => Boolean(step.pathExistsDfsView), surface: "treeView", render: (step) => {
      renderPathExistsDfsView(step);
    } },
    { predicate: (step) => Boolean(step.pathExistsBfsView), surface: "treeView", render: (step) => {
      renderPathExistsBfsView(step);
    } },
    { predicate: (step) => Boolean(step.bipartiteView), surface: "treeView", render: (step) => {
      renderBipartiteView(step);
    } },
    { predicate: (step) => Boolean(step.autocompleteView), surface: "treeView", render: (step) => {
      renderAutocompleteView(step);
    } },
    { predicate: (step) => Boolean(step.fileSystemView), surface: "treeView", render: (step) => {
      renderFileSystemView(step);
    } },
    { predicate: (step) => Boolean(step.wordDictionaryView), surface: "treeView", render: (step) => {
      renderWordDictionaryView(step);
    } },
    { predicate: (step) => Boolean(step.replaceWordsView), surface: "treeView", render: (step) => {
      renderReplaceWordsView(step);
    } },
    { predicate: (step) => Boolean(step.bstIteratorView), surface: "treeView", render: (step) => {
      renderBstIteratorView(step);
    } },
    { predicate: (step) => Boolean(step.closestBst270View), surface: "treeView", render: (step) => {
      renderClosestBst270View(step);
    } },
    { predicate: (step) => Boolean(step.boundary545View), surface: "treeView", render: (step) => {
      renderBoundary545View(step);
    } },
    { predicate: (step) => Boolean(step.consecutive549View), surface: "treeView", render: (step) => {
      renderConsecutive549View(step);
    } },
    { predicate: (step) => Boolean(step.closestLeaf742View), surface: "treeView", render: (step) => {
      renderClosestLeaf742View(step);
    } },
    { predicate: (step) => Boolean(step.inorderSuccessor510View), surface: "treeView", render: (step) => {
      renderInorderSuccessor510View(step);
    } },
    { predicate: (step) => Boolean(step.inorderSuccessor285View), surface: "treeView", render: (step) => {
      renderInorderSuccessor285View(step);
    } },
    { predicate: (step) => Boolean(step.closestBst272View), surface: "treeView", render: (step) => {
      renderClosestBst272View(step);
    } },
    { predicate: (step) => Boolean(step.palPathView), surface: "treeView", render: (step) => {
      renderPalindromePathView(step);
    } },
    { predicate: (step) => Boolean(step.separate1977View), surface: "treeView", render: (step) => {
      renderSeparate1977View(step);
    } },
    { predicate: (step) => Boolean(step.missing3718View), surface: "treeView", render: (step) => {
      renderMissing3718View(step);
    } },
    { predicate: (step) => Boolean(step.russian354View), surface: "treeView", render: (step) => {
      renderRussian354View(step);
    } },
    { predicate: (step) => Boolean(step.paren32View), surface: "treeView", render: (step) => {
      renderParen32View(step);
    } },
    { predicate: (step) => Boolean(step.wordBreakIIView), surface: "treeView", render: (step) => {
      renderWordBreakIIView(step);
    } },
    { predicate: (step) => Boolean(step.mountain1095View), surface: "treeView", render: (step) => {
      renderMountain1095View(step);
    } },
    { predicate: (step) => Boolean(step.directed685View), surface: "treeView", render: (step) => {
      renderDirected685View(step);
    } },
    { predicate: (step) => Boolean(step.employee690View), surface: "treeView", render: (step) => {
      renderEmployee690View(step);
    } },
    { predicate: (step) => Boolean(step.videos1311View), surface: "treeView", render: (step) => {
      renderVideos1311View(step);
    } },
    { predicate: (step) => Boolean(step.bombs2101View), surface: "treeView", render: (step) => {
      renderBombs2101View(step);
    } },
    { predicate: (step) => Boolean(step.throne1600View), surface: "treeView", render: (step) => {
      renderThrone1600View(step);
    } },
    { predicate: (step) => Boolean(step.nary429View), surface: "treeView", render: (step) => {
      renderNary429View(step);
    } },
    { predicate: (step) => Boolean(step.rotation1886View), surface: "treeView", render: (step) => {
      renderRotation1886View(step);
    } },
    { predicate: (step) => Boolean(step.convert2022View), surface: "treeView", render: (step) => {
      renderConvert2022View(step);
    } },
    { predicate: (step) => Boolean(step.overlap835View), surface: "treeView", render: (step) => {
      renderImageOverlap835View(step);
    } },
    { predicate: (step) => Boolean(step.search240View), surface: "treeView", render: (step) => {
      renderSearchMatrix240View(step);
    } },
    { predicate: (step) => Boolean(step.search74View), surface: "treeView", render: (step) => {
      renderSearchMatrix74View(step);
    } },
    { predicate: (step) => Boolean(step.zero73View), surface: "treeView", render: (step) => {
      renderSetMatrixZeroes73View(step);
    } },
    { predicate: (step) => Boolean(step.rotate48View), surface: "treeView", render: (step) => {
      renderRotate48View(step);
    } },
    { predicate: (step) => Boolean(step.spiral54View), surface: "treeView", render: (step) => {
      renderSpiral54View(step);
    } },
    { predicate: (step) => Boolean(step.univalue250View), surface: "treeView", render: (step) => {
      renderUnivalue250View(step);
    } },
    { predicate: (step) => Boolean(step.longestConsecutive298View), surface: "treeView", render: (step) => {
      renderLongestConsecutive298View(step);
    } },
    { predicate: (step) => Boolean(step.verticalOrder314View), surface: "treeView", render: (step) => {
      renderVerticalOrder314View(step);
    } },
    { predicate: (step) => Boolean(step.upsideDown156View), surface: "treeView", render: (step) => {
      renderUpsideDown156View(step);
    } },
    { predicate: (step) => Boolean(step.twoSumIIView), surface: "treeView", render: (step) => {
      renderTwoSumIIView(step);
    } },
    { predicate: (step) => Boolean(step.twoSum653HashView), surface: "treeView", render: (step) => {
      renderTwoSum653HashView(step);
    } },
    { predicate: (step) => Boolean(step.twoSum653View), surface: "treeView", render: (step) => {
      renderTwoSum653View(step);
    } },
    { predicate: (step) => Boolean(step.maxPathSum124View), surface: "treeView", render: (step) => {
      renderMaxPathSum124View(step);
    } },
    { predicate: (step) => Boolean(step.palindromeCuts132View), surface: "treeView", render: (step) => {
      renderPalindromeCuts132View(step);
    } },
    { predicate: (step) => Boolean(step.slidingMaximum239View), surface: "treeView", render: (step) => {
      renderSlidingMaximum239View(step);
    } },
    { predicate: (step) => Boolean(step.visiblePoints1610View), surface: "treeView", render: (step) => {
      renderVisiblePoints1610View(step);
    } },
    { predicate: (step) => Boolean(step.medianFinder295View), surface: "treeView", render: (step) => {
      renderMedianFinder295View(step);
    } },
    { predicate: (step) => Boolean(step.removeInvalid301View), surface: "treeView", render: (step) => {
      renderRemoveInvalidParentheses301View(step);
    } },
    { predicate: (step) => Boolean(step.burstBalloons312View), surface: "treeView", render: (step) => {
      renderBurstBalloons312View(step);
    } },
    { predicate: (step) => Boolean(step.longestIncreasingPath329View), surface: "treeView", render: (step) => {
      renderLongestIncreasingPath329View(step);
    } },
    { predicate: (step) => Boolean(step.validParenthesesPath2267View), surface: "treeView", render: (step) => {
      renderValidParenthesesPath2267View(step);
    } },
    { predicate: (step) => Boolean(step.splitArray410View), surface: "treeView", render: (step) => {
      renderSplitArray410View(step);
    } },
    { predicate: (step) => Boolean(step.allOne432View), surface: "treeView", render: (step) => {
      renderAllOne432View(step);
    } },
    { predicate: (step) => Boolean(step.freedomTrail514View), surface: "treeView", render: (step) => {
      renderFreedomTrail514View(step);
    } },
    { predicate: (step) => Boolean(step.raceCar818View), surface: "treeView", render: (step) => {
      renderRaceCar818View(step);
    } },
    { predicate: (step) => Boolean(step.crackingSafe753View), surface: "treeView", render: (step) => {
      renderCrackingSafe753View(step);
    } },
    { predicate: (step) => Boolean(step.raceCar818View), surface: "treeView", render: (step) => {
      renderRaceCar818View(step);
    } },
    { predicate: (step) => Boolean(step.inversePairs629View), surface: "treeView", render: (step) => {
      renderKInversePairs629View(step);
    } },
    { predicate: (step) => Boolean(step.strangePrinter664View), surface: "treeView", render: (step) => {
      renderStrangePrinter664View(step);
    } },
    { predicate: (step) => Boolean(step.countPalindromicSubsequences730View), surface: "treeView", render: (step) => {
      renderCountPalindromicSubsequences730View(step);
    } },
    { predicate: (step) => Boolean(step.cherryPickup741View), surface: "treeView", render: (step) => {
      renderCherryPickup741View(step);
    } },
    { predicate: (step) => Boolean(step.validPath1391View), surface: "treeView", render: (step) => {
      renderValidPath1391View(step);
    } },
    { predicate: (step) => Boolean(step.serverAllocator9018View), surface: "treeView", render: (step) => {
      renderServerAllocator9018View(step);
    } },
    { predicate: (step) => Boolean(step.tree), surface: "treeView", render: (step) => {
      renderTree(step);
    } },
    { predicate: (step) => Boolean(step.treeDpLessonView), surface: "treeView", render: (step) => {
      renderTreeDpLessonView(step);
    } },
    { predicate: (step) => Boolean(step.cycle2360View), surface: "treeView", render: (step) => {
      renderCycle2360View(step);
    } },
    { predicate: (step) => Boolean(step.countPaths1976View), surface: "treeView", render: (step) => {
      renderCountPaths1976View(step);
    } },
    { predicate: (step) => Boolean(step.graph), surface: "treeView", render: (step) => {
      renderGraph(step);
    } },
    { predicate: (step) => Boolean(step.shiftGridView), surface: "treeView", render: (step) => {
      renderShiftGridView(step);
    } },
    { predicate: (step) => Boolean(step.transpose867View), surface: "treeView", render: (step) => {
      renderTranspose867View(step);
    } },
    { predicate: (step) => Boolean(step.regexMatch10View), surface: "treeView", render: (step) => {
      renderRegexMatch10View(step);
    } },
    { predicate: (step) => Boolean(step.wildcardMatch44View), surface: "treeView", render: (step) => {
      renderWildcardMatch44View(step);
    } },
    { predicate: (step) => Boolean(step.maximalRectangle85View), surface: "treeView", render: (step) => {
      renderMaximalRectangle85View(step);
    } },
    { predicate: (step) => Boolean(step.grid), surface: "gridView", render: (step) => {
      renderGrid(step);
    } },
    { predicate: (step) => Boolean(step.floodFillView), surface: "treeView", render: (step) => {
      renderFloodFillView(step);
    } },
    { predicate: (step) => Boolean(step.virusView), surface: "treeView", render: (step) => {
      renderVirusView(step);
    } },
    { predicate: (step) => Boolean(step.gasStationView), surface: "treeView", render: (step) => {
      renderGasStationView(step);
    } },
    { predicate: (step) => Boolean(step.gasDepositsView), surface: "treeView", render: (step) => {
      renderGasDepositsView(step);
    } },
    { predicate: (step) => Boolean(step.gasCircularView), surface: "treeView", render: (step) => {
      renderGasCircularView(step);
    } },
    { predicate: (step) => Boolean(step.rottingOrangesView), surface: "treeView", render: (step) => {
      renderRottingOrangesView(step);
    } },
    { predicate: (step) => Boolean(step.trapRain2View), surface: "treeView", render: (step) => {
      renderTrapRain2View(step);
    } },
    { predicate: (step) => Boolean(step.descendantSum1973View), surface: "treeView", render: (step) => {
      renderDescendantSum1973View(step);
    } },
    { predicate: (step) => Boolean(step.averageSubtree2265View), surface: "treeView", render: (step) => {
      renderAverageSubtree2265View(step);
    } },
    { predicate: (step) => Boolean(step.distributeCoins979View), surface: "treeView", render: (step) => {
      renderDistributeCoins979View(step);
    } },
    { predicate: (step) => Boolean(step.largestBst333View), surface: "treeView", render: (step) => {
      renderLargestBst333View(step);
    } },
    { predicate: (step) => Boolean(step.maximumSumBst1373View), surface: "treeView", render: (step) => {
      renderMaximumSumBst1373View(step);
    } },
    { predicate: (step) => Boolean(step.maximumAverage1120View), surface: "treeView", render: (step) => {
      renderMaximumAverage1120View(step);
    } },
    { predicate: (step) => Boolean(step.bfsGrid), surface: "bfsGridView", render: (step) => {
      renderBfsGrid(step);
    } },
    { predicate: (step) => Boolean(step.binaryWatch401View), surface: "treeView", render: (step) => {
      renderBinaryWatch401View(step);
    } },
    { predicate: (step) => Boolean(step.subsets90BitmaskView), surface: "treeView", render: (step) => {
      renderSubsets90BitmaskView(step);
    } },
    { predicate: (step) => Boolean(step.subsets78BitmaskView), surface: "treeView", render: (step) => {
      renderSubsets78BitmaskView(step);
    } },
    { predicate: (step) => Boolean(step.oddEven975View), surface: "treeView", render: (step) => {
      renderOddEven975View(step);
    } },
    { predicate: (step) => Boolean(step.visibleQueue1944View), surface: "treeView", render: (step) => {
      renderVisibleQueue1944View(step);
    } },
    { predicate: (step) => Boolean(step.maxMin1950View), surface: "treeView", render: (step) => {
      renderMaxMin1950View(step);
    } },
    { predicate: (step) => Boolean(step.distinctSubseq940View), surface: "treeView", render: (step) => {
      renderDistinctSubseq940View(step);
    } },
    { predicate: (step) => Boolean(step.bstPreorder255View), surface: "treeView", render: (step) => {
      renderBstPreorder255View(step);
    } },
    { predicate: (step) => Boolean(step.validSubarrays1063View), surface: "treeView", render: (step) => {
      renderValidSubarrays1063View(step);
    } },
    { predicate: (step) => Boolean(step.totalStrength2281View), surface: "treeView", render: (step) => {
      renderTotalStrength2281View(step);
    } },
    { predicate: (step) => Boolean(step.visibleMountains2345View), surface: "treeView", render: (step) => {
      renderVisibleMountains2345View(step);
    } },
    { predicate: (step) => Boolean(step.maximumSumQueries2736View), surface: "treeView", render: (step) => {
      renderMaximumSumQueries2736View(step);
    } },
    { predicate: (step) => Boolean(step.buildingMeet2940View), surface: "treeView", render: (step) => {
      renderBuildingMeet2940View(step);
    } },
    { predicate: (step) => Boolean(step.productExcept238View), surface: "treeView", render: (step) => {
      renderProductExcept238View(step);
    } },
    { predicate: (step) => Boolean(step.uniqueEven3483View), surface: "treeView", render: (step) => {
      renderUniqueEven3483View(step);
    } },
    { predicate: (step) => Boolean(step.pourWater755View), surface: "treeView", render: (step) => {
      renderPourWater755View(step);
    } },
    { predicate: (step) => Boolean(step.champagne799View), surface: "treeView", render: (step) => {
      renderChampagne799View(step);
    } },
    { predicate: (step) => Boolean(step.diceRoll1223View), surface: "treeView", render: (step) => {
      renderDiceRoll1223View(step);
    } },
    { predicate: (step) => Boolean(step.cyclicShift4052View), surface: "treeView", render: (step) => {
      renderCyclicShift4052View(step);
    } },
    { predicate: (step) => Boolean(step.shadowPairs4054View), surface: "treeView", render: (step) => {
      renderShadowPairs4054View(step);
    } },
    { predicate: (step) => Boolean(step.shadowPairs4055View), surface: "treeView", render: (step) => {
      renderShadowPairs4055View(step);
    } },
    { predicate: (step) => Boolean(step.equallySpaced4048View), surface: "treeView", render: (step) => {
      renderEquallySpaced4048View(step);
    } },
    { predicate: (step) => Boolean(step.equallySpaced4049View), surface: "treeView", render: (step) => {
      renderEquallySpaced4049View(step);
    } },
    { predicate: (step) => Boolean(step.minDays4050View), surface: "treeView", render: (step) => {
      renderMinDays4050View(step);
    } },
    { predicate: (step) => Boolean(step.distantSubarrays4051View), surface: "treeView", render: (step) => {
      renderDistantSubarrays4051View(step);
    } },
    { predicate: (step) => Boolean(step.rectangleArea223View), surface: "treeView", render: (step) => {
      renderRectangleArea223View(step);
    } },
    { predicate: (step) => Boolean(step.rectangleOverlap836View), surface: "treeView", render: (step) => {
      renderRectangleOverlap836View(step);
    } },
    { predicate: (step) => Boolean(step.circleRectangle1401View), surface: "treeView", render: (step) => {
      renderCircleRectangle1401View(step);
    } },
    { predicate: (step) => Boolean(step.orderlyQueue899View), surface: "treeView", render: (step) => {
      renderOrderlyQueue899View(step);
    } },
    { predicate: (step) => Boolean(step.shortestPalindrome214View), surface: "treeView", render: (step) => {
      renderShortestPalindrome214View(step);
    } },
    { predicate: (step) => Boolean(step.palindrome2472View), surface: "treeView", render: (step) => {
      renderPalindrome2472View(step);
    } },
    { predicate: (step) => Boolean(step.lineSegments1621View), surface: "treeView", render: (step) => {
      renderLineSegments1621View(step);
    } },
    { predicate: (step) => Boolean(step.divideString2138View), surface: "treeView", render: (step) => {
      renderDivideString2138View(step);
    } },
    { predicate: (step) => Boolean(step.textJustification68View), surface: "treeView", render: (step) => {
      renderTextJustification68View(step);
    } },
    { predicate: (step) => Boolean(step.maximizeScore2818View), surface: "treeView", render: (step) => {
      renderMaximizeScore2818View(step);
    } },
    { predicate: (step) => Boolean(step.minIncrements1526View), surface: "treeView", render: (step) => {
      renderMinIncrements1526View(step);
    } },
    { predicate: (step) => Boolean(step.countCommas3870View), surface: "treeView", render: (step) => {
      renderCountCommas3870View(step);
    } },
    { predicate: (step) => Boolean(step.countCommas3871View), surface: "treeView", render: (step) => {
      renderCountCommas3871View(step);
    } },
    { predicate: (step) => Boolean(step.stable3903View), surface: "treeView", render: (step) => {
      renderStable3903View(step);
    } },
    { predicate: (step) => Boolean(step.criticalPoints2058View), surface: "treeView", render: (step) => {
      renderCriticalPoints2058View(step);
    } },
    { predicate: (step) => Boolean(step.linkedList), surface: "treeView", render: (step) => {
      renderLinkedList(step);
    } },
    { predicate: (step) => Boolean(step.onlineElectionView), surface: "treeView", render: (step) => {
      renderOnlineElectionView(step);
    } },
    { predicate: (step) => Boolean(step.shipCapacityView), surface: "treeView", render: (step) => {
      renderShipCapacityView(step);
    } },
    { predicate: (step) => Boolean(step.kokoSpeedView), surface: "treeView", render: (step) => {
      renderKokoSpeedView(step);
    } },
    { predicate: (step) => Boolean(step.sqrtBinaryView), surface: "treeView", render: (step) => {
      renderSqrtBinaryView(step);
    } },
    { predicate: (step) => Boolean(step.nonOverlapView), surface: "treeView", render: (step) => {
      renderNonOverlapView(step);
    } },
    { predicate: (step) => Boolean(step.leaves366View), surface: "treeView", render: (step) => {
      renderLeaves366View(step);
    } },
    { predicate: (step) => Boolean(step.logger359View), surface: "treeView", render: (step) => {
      renderLogger359View(step);
    } },
    { predicate: (step) => Boolean(step.rleIter900View), surface: "treeView", render: (step) => {
      renderRleIter900View(step);
    } },
    { predicate: (step) => Boolean(step.matchSubseq792View), surface: "treeView", render: (step) => {
      renderMatchSubseq792View(step);
    } },
    { predicate: (step) => Boolean(step.attendance552View), surface: "treeView", render: (step) => {
      renderAttendance552View(step);
    } },
    { predicate: (step) => Boolean(step.battleships419View), surface: "treeView", render: (step) => {
      renderBattleships419View(step);
    } },
    { predicate: (step) => Boolean(step.screenFit418View), surface: "treeView", render: (step) => {
      renderScreenFit418View(step);
    } },
    { predicate: (step) => Boolean(step.differByOne1554View), surface: "treeView", render: (step) => {
      renderDifferByOne1554View(step);
    } },
    { predicate: (step) => Boolean(step.shortestWay1055View), surface: "treeView", render: (step) => {
      renderShortestWay1055View(step);
    } },
    { predicate: (step) => Boolean(step.swimWater778View), surface: "treeView", render: (step) => {
      renderSwimWater778View(step);
    } },
    { predicate: (step) => Boolean(step.gridElim1293View), surface: "treeView", render: (step) => {
      renderGridElim1293View(step);
    } },
    { predicate: (step) => Boolean(step.gcThreshold1627View), surface: "treeView", render: (step) => {
      renderGcThreshold1627View(step);
    } },
    { predicate: (step) => Boolean(step.clockDiffView), surface: "treeView", render: (step) => {
      renderClockDiffView(step);
    } },
    { predicate: (step) => Boolean(step.lrSwapView), surface: "treeView", render: (step) => {
      renderLrSwapView(step);
    } },
    { predicate: (step) => Boolean(step.randomPickView), surface: "treeView", render: (step) => {
      renderRandomPickView(step);
    } },
    { predicate: (step) => Boolean(step.searchRangeView), surface: "treeView", render: (step) => {
      renderSearchRangeView(step);
    } },
    { predicate: (step) => Boolean(step.blockQueriesView), surface: "treeView", render: (step) => {
      renderBlockQueriesView(step);
    } },
    { predicate: (step) => Boolean(step.histogramRectangleView), surface: "treeView", render: (step) => {
      renderHistogramRectangleView(step);
    } },
    { predicate: (step) => Boolean(step.maxNonDecreasingView), surface: "treeView", render: (step) => {
      renderMaxNonDecreasingView(step);
    } },
    { predicate: (step) => Boolean(step.boundaryMaxView), surface: "treeView", render: (step) => {
      renderBoundaryMaxView(step);
    } },
    { predicate: (step) => Boolean(step.sortedSubmatrixView), surface: "treeView", render: (step) => {
      renderSortedSubmatrixView(step);
    } },
    { predicate: (step) => Boolean(step.stackView), surface: "treeView", render: (step) => {
      renderStackView(step);
    } },
    { predicate: (step) => Boolean(step.circularDequeView), surface: "treeView", render: (step) => {
      renderCircularDequeView(step);
    } },
    { predicate: (step) => Boolean(step.queueView), surface: "treeView", render: (step) => {
      renderQueueView(step);
    } },
    { predicate: (step) => Boolean(step.calculator770View), surface: "treeView", render: (step) => {
      renderBasicCalculatorIV770View(step);
    } },
    { predicate: (step) => Boolean(step.calculator772View), surface: "treeView", render: (step) => {
      renderCalculator772View(step);
    } },
    { predicate: (step) => Boolean(step.calculator772bView), surface: "treeView", render: (step) => {
      renderCalculator772BView(step);
    } },
    { predicate: (step) => Boolean(step.camera968View), surface: "treeView", render: (step) => {
      renderCamera968View(step);
    } },
    { predicate: (step) => Boolean(step.mountain1095View), surface: "treeView", render: (step) => {
      renderMountain1095View(step);
    } },
    { predicate: (step) => Boolean(step.tiling1240View), surface: "treeView", render: (step) => {
      renderTiling1240View(step);
    } },
    { predicate: (step) => Boolean(step.students1349View), surface: "treeView", render: (step) => {
      renderStudents1349View(step);
    } },
    { predicate: (step) => Boolean(step.superstring943View), surface: "treeView", render: (step) => {
      renderSuperstring943View(step);
    } },
    { predicate: (step) => Boolean(step.goodStrings1397View), surface: "treeView", render: (step) => {
      renderGoodStrings1397View(step);
    } },
    { predicate: (step) => Boolean(step.distribute1655View), surface: "treeView", render: (step) => {
      renderDistribute1655View(step);
    } },
    { predicate: (step) => Boolean(step.distribute1655BacktrackView), surface: "treeView", render: (step) => {
      renderDistribute1655BacktrackView(step);
    } },
    { predicate: (step) => Boolean(step.sentenceView), surface: "treeView", render: (step) => {
      renderSentenceView(step);
    } },
    { predicate: (step) => Boolean(step.synonymSentenceView), surface: "treeView", render: (step) => {
      renderSynonymSentenceView(step);
    } },
    { predicate: (step) => Boolean(step.prefix2DView), surface: "treeView", render: (step) => {
      renderPrefix2DView(step);
    } },
    { predicate: (step) => Boolean(step.prefixSumCountView), surface: "treeView", render: (step) => {
      renderPrefixSumCountView(step);
    } },
    { predicate: (step) => Boolean(step.prefixRemainderView), surface: "treeView", render: (step) => {
      renderPrefixRemainderView(step);
    } },
    { predicate: (step) => Boolean(step.differenceArrayView), surface: "treeView", render: (step) => {
      renderDifferenceArrayView(step);
    } },
    { predicate: (step) => Boolean(step.runningSumView), surface: "treeView", render: (step) => {
      renderRunningSumView(step);
    } },
    { predicate: (step) => Boolean(step.missingIntegerView), surface: "treeView", render: (step) => {
      renderMissingIntegerView(step);
    } },
    { predicate: (step) => Boolean(step.calendarThreeView), surface: "treeView", render: (step) => {
      renderCalendarThreeView(step);
    } },
    { predicate: (step) => Boolean(step.fallingSquaresView), surface: "treeView", render: (step) => {
      renderFallingSquaresView(step);
    } },
    { predicate: (step) => Boolean(step.reversePairsSegmentTreeView), surface: "treeView", render: (step) => {
      renderReversePairsSegmentTreeView(step);
    } },
    { predicate: (step) => Boolean(step.reversePairsView), surface: "treeView", render: (step) => {
      renderReversePairsView(step);
    } },
    { predicate: (step) => Boolean(step.sortedArrayCostView), surface: "treeView", render: (step) => {
      renderSortedArrayCostView(step);
    } },
    { predicate: (step) => Boolean(step.rangeSumFenwickView), surface: "treeView", render: (step) => {
      renderRangeSumFenwickView(step);
    } },
    { predicate: (step) => Boolean(step.rangeSumSegmentTreeView), surface: "treeView", render: (step) => {
      renderRangeSumSegmentTreeView(step);
    } },
    { predicate: (step) => Boolean(step.rangeSumCountView), surface: "treeView", render: (step) => {
      renderRangeSumCountView(step);
    } },
    { predicate: (step) => Boolean(step.countSmallerView), surface: "treeView", render: (step) => {
      renderCountSmallerView(step);
    } },
    { predicate: (step) => Boolean(step.evenOddRatioView), surface: "treeView", render: (step) => {
      renderEvenOddRatioView(step);
    } },
    { predicate: (step) => Boolean(step.bookMyShowView), surface: "treeView", render: (step) => {
      renderBookMyShowView(step);
    } },
    { predicate: (step) => Boolean(step.trappingRainView), surface: "treeView", render: (step) => {
      renderTrappingRainView(step);
    } },
    { predicate: (step) => Boolean(step.sumQueriesView), surface: "treeView", render: (step) => {
      renderSumQueriesView(step);
    } },
    { predicate: (step) => Boolean(step.segmentTreeView), surface: "treeView", render: (step) => {
      renderSegmentTreeView(step);
    } },
    { predicate: (step) => Boolean(step.fenwickView), surface: "treeView", render: (step) => {
      renderFenwickView(step);
    } },
    { predicate: (step) => Boolean(step.rangeFrequencyView), surface: "treeView", render: (step) => {
      renderRangeFrequencyView(step);
    } },
    { predicate: (step) => Boolean(step.prefix1DView), surface: "treeView", render: (step) => {
      renderPrefix1DView(step);
    } },
    { predicate: (step) => Boolean(step.evenOddFillView), surface: "treeView", render: (step) => {
      renderEvenOddFillView(step);
    } },
    { predicate: (step) => Boolean(step.digitPodiumView), surface: "treeView", render: (step) => {
      renderDigitPodiumView(step);
    } },
    { predicate: (step) => Boolean(step.jewelsStonesView), surface: "treeView", render: (step) => {
      renderJewelsStonesView(step);
    } },
    { predicate: (step) => Boolean(step.palindromePartitionView), surface: "treeView", render: (step) => {
      renderPalindromePartitionView(step);
    } },
    { predicate: (step) => Boolean(step.nonDecreasingView), surface: "treeView", render: (step) => {
      renderNonDecreasingSubsequencesView(step);
    } },
    { predicate: (step) => Boolean(step.partitionView), surface: "treeView", render: (step) => {
      renderPartitionView(step);
    } },
    { predicate: (step) => Boolean(step.twoPointerMergeView), surface: "treeView", render: (step) => {
      renderTwoPointerMergeView(step);
    } },
    { predicate: (step) => Boolean(step.triangleCountView), surface: "treeView", render: (step) => {
      renderTriangleCountView(step);
    } },
    { predicate: (step) => Boolean(step.multiSlotPodiumView), surface: "treeView", render: (step) => {
      renderMultiSlotPodiumView(step);
    } },
    { predicate: (step) => Boolean(step.substringConcatView), surface: "treeView", render: (step) => {
      renderSubstringConcatView(step);
    } },
    { predicate: (step) => Boolean(step.sequenceTraceView), surface: "treeView", render: (step) => {
      renderSequenceTraceView(step);
    } },
    { predicate: (step) => Boolean(step.taskSchedulerView), surface: "treeView", render: (step) => {
      renderTaskSchedulerView(step);
    } },
    { predicate: (step) => Boolean(step.happyNumberView), surface: "treeView", render: (step) => {
      renderHappyNumberView(step);
    } },
    { predicate: (step) => Boolean(step.reverse344View || step.smallHashView), surface: "treeView", render: (step) => {
      renderSmallHashView(step);
    } },
    { predicate: (step) => Boolean(step.balanced1234View), surface: "treeView", render: (step) => {
      renderBalanced1234View(step);
    } },
    { predicate: (step) => Boolean(step.nice1248View), surface: "treeView", render: (step) => {
      renderNice1248View(step);
    } },
    { predicate: (step) => Boolean(step.exactK992View), surface: "treeView", render: (step) => {
      renderExactK992View(step);
    } },
    { predicate: (step) => Boolean(step.complement1658View), surface: "treeView", render: (step) => {
      renderComplement1658View(step);
    } },
    { predicate: (step) => Boolean(step.numberBfs2059View), surface: "treeView", render: (step) => {
      renderNumberBfs2059View(step);
    } },
    { predicate: (step) => Boolean(step.shelfDp1105View), surface: "treeView", render: (step) => {
      renderShelfDp1105View(step);
    } },
    { predicate: (step) => Boolean(step.serverHeap1606View), surface: "treeView", render: (step) => {
      renderServerHeap1606View(step);
    } },
    { predicate: (step) => Boolean(step.meetingRooms2402View), surface: "treeView", render: (step) => {
      renderMeetingRooms2402View(step);
    } },
    { predicate: (step) => Boolean(step.adjacentRuns3350View), surface: "treeView", render: (step) => {
      renderAdjacentRuns3350View(step);
    } },
    { predicate: (step) => Boolean(step.digitSum3550View), surface: "treeView", render: (step) => {
      renderDigitSum3550View(step);
    } },
    { predicate: (step) => Boolean(step.permutation1589View), surface: "treeView", render: (step) => {
      renderPermutation1589View(step);
    } },
    { predicate: (step) => Boolean(step.prefixScores2416View), surface: "treeView", render: (step) => {
      renderPrefixScores2416View(step);
    } },
    { predicate: (step) => Boolean(step.specialBinary761View), surface: "treeView", render: (step) => {
      renderSpecialBinary761View(step);
    } },
    { predicate: (step) => Boolean(step.braceExpansion1096View), surface: "treeView", render: (step) => {
      renderBraceExpansion1096View(step);
    } },
    { predicate: (step) => Boolean(step.weakCharacters1996View), surface: "treeView", render: (step) => {
      renderWeakCharacters1996View(step);
    } },
    { predicate: (step) => Boolean(step.longestLine562View), surface: "treeView", render: (step) => {
      renderLongestLine562View(step);
    } },
    { predicate: (step) => Boolean(step.nodeSequence2242View), surface: "treeView", render: (step) => {
      renderNodeSequence2242View(step);
    } },
    { predicate: (step) => Boolean(step.slidingFreqView), surface: "treeView", render: (step) => {
      renderSlidingFreqView(step);
    } },
    { predicate: (step) => Boolean(step.candyAllocationView), surface: "treeView", render: (step) => {
      renderCandyAllocationView(step);
    } },
    { predicate: (step) => Boolean(step.repeatingRunsView), surface: "treeView", render: (step) => {
      renderRepeatingRunsView(step);
    } },
    { predicate: (step) => Boolean(step.binaryReductionView), surface: "treeView", render: (step) => {
      renderBinaryReductionView(step);
    } },
    { predicate: (step) => Boolean(step.fourSumPairsView), surface: "treeView", render: (step) => {
      renderFourSumPairsView(step);
    } },
    { predicate: (step) => Boolean(step.elevator4027View), surface: "treeView", render: (step) => {
      renderElevator4027View(step);
    } },
    { predicate: (step) => Boolean(step.randomizedSet380View), surface: "treeView", render: (step) => {
      renderRandomizedSet380View(step);
    } },
    { predicate: (step) => Boolean(step.randomizedCollection381View), surface: "treeView", render: (step) => {
      renderRandomizedCollection381View(step);
    } },
    { predicate: (step) => Boolean(step.lexSwap2948View), surface: "treeView", render: (step) => {
      renderLexSwap2948View(step);
    } },
    { predicate: (step) => Boolean(step.allocator2502View), surface: "treeView", render: (step) => {
      renderAllocator2502View(step);
    } },
    { predicate: (step) => Boolean(step.dataStream352View), surface: "treeView", render: (step) => {
      renderDataStream352View(step);
    } },
    { predicate: (step) => Boolean(step.maxPoints149View), surface: "treeView", render: (step) => {
      renderMaxPoints149View(step);
    } },
    { predicate: (step) => Boolean(step.removeBoxes546View), surface: "treeView", render: (step) => {
      renderRemoveBoxes546View(step);
    } },
    { predicate: (step) => Boolean(step.stoneGame1872View), surface: "treeView", render: (step) => {
      renderStoneGame1872View(step);
    } },
    { predicate: (step) => Boolean(step.absoluteSubarrayView), surface: "treeView", render: (step) => {
      renderAbsoluteSubarray1749View(step);
    } },
    { predicate: (step) => Boolean(step.circularSubarrayView), surface: "treeView", render: (step) => {
      renderCircularMaximumSubarrayView(step);
    } },
    { predicate: (step) => Boolean(step.maximumSubarrayView), surface: "treeView", render: (step) => {
      renderMaximumSubarrayView(step);
    } },
    { predicate: (step) => Boolean(step.sparseVector1570View), surface: "treeView", render: (step) => {
      renderSparseVector1570View(step);
    } },
];

function renderStep() {
  const step = steps[stepIndex];
  if (!step) return;

  $("stepTitle").textContent = pick(step.title);
  $("stepCounter").textContent = t().stepCounter(stepIndex + 1, steps.length);
  $("stepNote").textContent = pick(step.note);
  updateCodeHighlight(step.codeLines || [], step.codeBlock || 1);
  renderVars(step, stepIndex > 0 ? steps[stepIndex - 1] : null);

  const rendererEntry = ORDERED_RENDERER_REGISTRY.find(({ predicate }) => predicate(step)) || {
    surface: "bars",
    render: renderBars,
  };
  setPrimaryVisualizationSurface(rendererEntry.surface);
  rendererEntry.render(step);

  // Backtracking problems keep their original board/array/grid above and show
  // the persistent decision tree in parallel underneath. Problem 77 already
  // uses the main tree view as its decision tree, so it does not need this pane.
  if (step.decisionTree && !step.__live) {
    $("decisionTreeView").classList.remove("hidden");
    renderDecisionTree(step);
  } else {
    $("decisionTreeView").classList.add("hidden");
  }

  // navigation buttons
  $("firstBtn").disabled = stepIndex === 0;
  $("prevBtn").disabled = stepIndex === 0;
  $("nextBtn").disabled = stepIndex === steps.length - 1;
  $("lastBtn").disabled = stepIndex === steps.length - 1;

  // result box
  if (step.final) {
    const displayedAnswer = Array.isArray(answerValue) ? JSON.stringify(answerValue) : answerValue;
    $("answer").textContent = t().answer(displayedAnswer);
    show("answer");
  } else {
    hide("answer");
  }
}

// ---- Utilities ----
function show(id) {
  $(id).classList.remove("hidden");
}
function hide(id) {
  $(id).classList.add("hidden");
}
function showError(id, msg) {
  const el = $(id);
  el.textContent = msg;
  el.classList.remove("hidden");
}

function showRichError(id, html) {
  const el = $(id);
  el.innerHTML = html;
  el.classList.remove("hidden");
}

function formatPythonRuntimeError(err) {
  const raw = ((err && err.message) || String(err || "")).trim();
  const text = raw.replace(/^PythonError:\s*/i, "").trim();
  const lines = text.split(/\r?\n/).map((line) => line.trimEnd()).filter(Boolean);
  const userFrames = [...text.matchAll(/File\s+"<usercode>",\s+line\s+(\d+),\s+in\s+([A-Za-z_]\w*)/g)];
  const lastUserFrame = userFrames.length ? userFrames[userFrames.length - 1] : null;
  const errorLine = [...lines].reverse().find((line) => /^[A-Za-z_]\w*(?:Error|Exception|Warning)\s*:/.test(line)) || lines[lines.length - 1] || text;
  const errorMatch = errorLine.match(/^([A-Za-z_]\w*)\s*:\s*(.*)$/);
  const errorType = errorMatch ? errorMatch[1] : "Runtime error";
  const errorMessage = errorMatch ? errorMatch[2] : errorLine;
  const lineNumber = lastUserFrame ? Number(lastUserFrame[1]) : null;
  const functionName = lastUserFrame ? lastUserFrame[2] : null;
  const hintMap = {
    IndexError: lang === "vi"
      ? "Kiểm tra lại index, độ dài list, hoặc dữ liệu input. Lỗi này thường xảy ra khi truy cập arr[i] nhưng i nằm ngoài phạm vi."
      : "Check the index, list length, or input data. This usually happens when arr[i] is outside the valid range.",
    KeyError: lang === "vi"
      ? "Key chưa tồn tại trong dict/set lookup. Thử kiểm tra điều kiện trước khi truy cập hoặc dùng dict.get(...)."
      : "The key does not exist for this dict/set lookup. Check before accessing it or use dict.get(...).",
    TypeError: lang === "vi"
      ? "Kiểm tra kiểu dữ liệu hoặc số lượng tham số truyền vào hàm."
      : "Check the data type or the number of arguments passed to a function.",
    ValueError: lang === "vi"
      ? "Một giá trị không đúng định dạng/kỳ vọng. Kiểm tra bước ép kiểu hoặc parse input."
      : "A value has an unexpected format. Check type conversion or input parsing.",
    AttributeError: lang === "vi"
      ? "Object không có thuộc tính/phương thức này. Kiểm tra biến có đúng kiểu mong muốn không."
      : "The object does not have this attribute/method. Check whether the variable has the expected type.",
    NameError: lang === "vi"
      ? "Tên biến/hàm chưa được khai báo hoặc bị gõ sai."
      : "A variable/function name is missing or misspelled.",
  };
  const hint = hintMap[errorType] || (lang === "vi"
    ? "Xem dòng được báo bên dưới, kiểm tra biến local và điều kiện biên quanh dòng đó."
    : "Look at the reported line below, then check local variables and boundary conditions around it.");
  const title = lang === "vi" ? "Code của bạn gặp lỗi khi chạy" : "Your code hit a runtime error";
  const location = lineNumber
    ? (lang === "vi" ? `Dòng ${lineNumber}${functionName ? ` trong ${functionName}()` : ""}` : `Line ${lineNumber}${functionName ? ` in ${functionName}()` : ""}`)
    : (lang === "vi" ? "Không xác định được dòng trong code của bạn" : "Could not identify a user-code line");
  return `
    <div class="live-error-card">
      <div class="live-error-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(errorType)}</span>
      </div>
      <div class="live-error-message">${escapeHtml(errorMessage || errorType)}</div>
      <div class="live-error-meta">
        <span>${escapeHtml(location)}</span>
      </div>
      <div class="live-error-hint">${escapeHtml(hint)}</div>
      <details class="live-error-details">
        <summary>${escapeHtml(lang === "vi" ? "Chi tiết kỹ thuật" : "Technical details")}</summary>
        <pre>${escapeHtml(text)}</pre>
      </details>
    </div>`;
}

// Initialize
applyStaticStrings();
setCodeSnippetBlurred(readCodeSnippetBlurPreference());
loadCatalog();

// Restore last opened problem from localStorage
const savedId = localStorage.getItem("lastProblemId");
if (savedId) {
  $("problemId").value = savedId;
}
loadProblem();

// ---- Theme toggle (auto/dark/light) ----
(function initTheme() {
  const saved = localStorage.getItem("theme");
  const savedMode = localStorage.getItem("themeMode");
  themeMode = savedMode === "auto" ? "auto" : "manual";
  if (themeMode === "auto") {
    applyAutoTheme();
    themeAutoTimer = window.setInterval(applyAutoTheme, 60000);
  } else {
    applyTheme(saved === "light" ? "light" : "dark");
  }
  updateThemeButtons();
})();

$("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.dataset.theme || "dark";
  const next = current === "dark" ? "light" : "dark";
  setThemeMode("manual");
  applyTheme(next);
  localStorage.setItem("theme", next);
});

$("themeAuto").addEventListener("click", () => {
  if (themeMode === "auto") {
    setThemeMode("manual");
    localStorage.setItem("theme", document.documentElement.dataset.theme || "dark");
  } else {
    setThemeMode("auto");
    applyAutoTheme();
  }
});

function themeFromCurrentTime(now = new Date()) {
  const hour = now.getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

function setThemeMode(mode) {
  themeMode = mode === "auto" ? "auto" : "manual";
  localStorage.setItem("themeMode", themeMode);
  if (themeAutoTimer) {
    window.clearInterval(themeAutoTimer);
    themeAutoTimer = null;
  }
  if (themeMode === "auto") {
    themeAutoTimer = window.setInterval(applyAutoTheme, 60000);
  }
  updateThemeButtons();
}

function applyAutoTheme() {
  const theme = themeFromCurrentTime();
  applyTheme(theme);
  localStorage.setItem("theme", theme);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (window.monaco && window.monaco.editor) {
    window.monaco.editor.setTheme(theme === "dark" ? "leetcode-python-dark" : "leetcode-python-light");
  }
  const moonIcon = $("themeIconMoon");
  const sunIcon = $("themeIconSun");
  if (theme === "dark") {
    moonIcon.classList.add("hidden");
    sunIcon.classList.remove("hidden");
  } else {
    moonIcon.classList.remove("hidden");
    sunIcon.classList.add("hidden");
  }
  updateThemeButtons();
}

function updateThemeButtons() {
  const autoBtn = $("themeAuto");
  if (autoBtn) {
    autoBtn.textContent = t().autoTheme || "Auto";
    autoBtn.classList.toggle("active", themeMode === "auto");
    autoBtn.setAttribute("aria-pressed", themeMode === "auto" ? "true" : "false");
    autoBtn.title = themeMode === "auto"
      ? (lang === "vi" ? "Đang tự động đổi sáng/tối theo giờ hiện tại" : "Using day/night by current time")
      : (lang === "vi" ? "Bật tự động sáng/tối theo giờ hiện tại" : "Use day/night by current time");
  }
  const toggleBtn = $("themeToggle");
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-label", themeMode === "auto"
      ? (lang === "vi" ? "Chuyển sang chỉnh theme thủ công" : "Switch to manual theme")
      : (lang === "vi" ? "Đổi sáng/tối" : "Toggle theme"));
  }
}

// =====================================================================
// ---- Live Python editor (Monaco + Pyodide) ----
// Lets the user freely edit the shown Python code and re-run it for real
// in the browser (via Pyodide/WebAssembly), tracing every executed line
// and the local variables at that point (via sys.settrace), independent
// of the hand-authored step animations above. Both libraries are loaded
// lazily, only the first time the user opens the editor.
// =====================================================================

let monacoEditorInstance = null;
let monacoLoadPromise = null;
let monacoSourceKey = null;
let pythonCompletionsRegistered = false;
let monacoThemesRegistered = false;
let pyodideInstance = null;
let pyodideLoadPromise = null;
let liveMode = false;
let liveSteps = [];
let liveResizeInitialized = false;
let liveCopyResetTimer = null;

const LIVE_I18N = {
  vi: {
    loading: "Đang tải Python runtime (chỉ lần đầu)...",
    running: "Đang chạy...",
    ready: (n) => `Đã chạy xong — ${n} bước.`,
    doneNoTrace: "Chạy xong nhưng không bắt được dòng nào (code có thể không gọi hàm nào).",
    copied: "✓ Đã sao chép!",
    copyFailed: "Không thể sao chép code.",
  },
  en: {
    loading: "Loading Python runtime (first time only)...",
    running: "Running...",
    ready: (n) => `Finished — ${n} step(s).`,
    doneNoTrace: "Ran successfully but no traced lines were captured (no function was called).",
    copied: "✓ Copied!",
    copyFailed: "Could not copy code.",
  },
};
const lt = () => LIVE_I18N[lang] || LIVE_I18N.en;

function loadMonaco() {
  if (monacoLoadPromise) return monacoLoadPromise;
  monacoLoadPromise = new Promise((resolve, reject) => {
    if (!window.require) {
      reject(new Error("Monaco loader script not found"));
      return;
    }
    window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs" } });
    window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
  });
  return monacoLoadPromise;
}

function registerMonacoThemes(monaco) {
  if (monacoThemesRegistered) return;
  monacoThemesRegistered = true;

  monaco.editor.defineTheme("leetcode-python-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      { token: "keyword", foreground: "C586C0" },
      { token: "keyword.control", foreground: "C586C0" },
      { token: "keyword.flow", foreground: "C586C0" },
      { token: "keyword.operator", foreground: "D4D4D4" },
      { token: "string", foreground: "CE9178" },
      { token: "string.escape", foreground: "D7BA7D" },
      { token: "number", foreground: "B5CEA8" },
      { token: "type", foreground: "4EC9B0" },
      { token: "type.identifier", foreground: "4EC9B0" },
      { token: "identifier", foreground: "9CDCFE" },
      { token: "function", foreground: "DCDCAA" },
      { token: "delimiter", foreground: "D4D4D4" },
      { token: "operator", foreground: "D4D4D4" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.foreground": "#D4D4D4",
      "editorLineNumber.foreground": "#858585",
      "editorLineNumber.activeForeground": "#C6C6C6",
      "editor.lineHighlightBackground": "#2A2D2E",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#AEAFAD",
      "editor.selectionBackground": "#264F78",
      "editor.inactiveSelectionBackground": "#3A3D41",
      "editorIndentGuide.background1": "#404040",
      "editorIndentGuide.activeBackground1": "#707070",
      "editorBracketHighlight.foreground1": "#FFD700",
      "editorBracketHighlight.foreground2": "#DA70D6",
      "editorBracketHighlight.foreground3": "#179FFF",
      "editorBracketHighlight.foreground4": "#FFD700",
      "editorBracketHighlight.foreground5": "#DA70D6",
      "editorBracketHighlight.foreground6": "#179FFF",
      "editorSuggestWidget.background": "#252526",
      "editorSuggestWidget.border": "#454545",
      "editorSuggestWidget.foreground": "#D4D4D4",
      "editorSuggestWidget.highlightForeground": "#4FC1FF",
      "editorSuggestWidget.selectedBackground": "#04395E",
      "editorSuggestWidget.selectedForeground": "#FFFFFF",
      "editorSuggestWidget.focusHighlightForeground": "#9CDCFE",
      "editorSuggestWidgetStatus.foreground": "#C5C5C5",
      "editorWidget.background": "#252526",
      "editorHoverWidget.background": "#252526",
    },
  });

  monaco.editor.defineTheme("leetcode-python-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "008000", fontStyle: "italic" },
      { token: "keyword", foreground: "AF00DB" },
      { token: "keyword.control", foreground: "AF00DB" },
      { token: "keyword.flow", foreground: "AF00DB" },
      { token: "keyword.operator", foreground: "000000" },
      { token: "string", foreground: "A31515" },
      { token: "string.escape", foreground: "EE0000" },
      { token: "number", foreground: "098658" },
      { token: "type", foreground: "267F99" },
      { token: "type.identifier", foreground: "267F99" },
      { token: "identifier", foreground: "001080" },
      { token: "function", foreground: "795E26" },
      { token: "delimiter", foreground: "000000" },
      { token: "operator", foreground: "000000" },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#000000",
      "editorLineNumber.foreground": "#237893",
      "editorLineNumber.activeForeground": "#0B216F",
      "editor.lineHighlightBackground": "#F3F3F3",
      "editor.lineHighlightBorder": "#00000000",
      "editorCursor.foreground": "#000000",
      "editor.selectionBackground": "#ADD6FF",
      "editor.inactiveSelectionBackground": "#E5EBF1",
      "editorIndentGuide.background1": "#D3D3D3",
      "editorIndentGuide.activeBackground1": "#939393",
      "editorBracketHighlight.foreground1": "#0431FA",
      "editorBracketHighlight.foreground2": "#319331",
      "editorBracketHighlight.foreground3": "#7B3814",
      "editorSuggestWidget.background": "#F3F3F3",
      "editorSuggestWidget.border": "#C8C8C8",
      "editorSuggestWidget.foreground": "#1F1F1F",
      "editorSuggestWidget.highlightForeground": "#0066BF",
      "editorSuggestWidget.selectedBackground": "#D6EBFF",
      "editorSuggestWidget.selectedForeground": "#111111",
      "editorSuggestWidget.focusHighlightForeground": "#004C8C",
      "editorSuggestWidgetStatus.foreground": "#4F4F4F",
    },
  });
}

function registerPythonCompletions(monaco) {
  if (pythonCompletionsRegistered) return;
  pythonCompletionsRegistered = true;

  const keywords = [
    "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "False", "finally", "for",
    "from", "global", "if", "import", "in", "is", "lambda", "None",
    "nonlocal", "not", "or", "pass", "raise", "return", "True", "try",
    "while", "with", "yield",
  ];
  const builtins = [
    ["abs", "abs(${1:value})"],
    ["all", "all(${1:iterable})"],
    ["any", "any(${1:iterable})"],
    ["bin", "bin(${1:number})"],
    ["bool", "bool(${1:value})"],
    ["chr", "chr(${1:code})"],
    ["dict", "dict(${1})"],
    ["divmod", "divmod(${1:a}, ${2:b})"],
    ["enumerate", "enumerate(${1:iterable})"],
    ["filter", "filter(${1:function}, ${2:iterable})"],
    ["float", "float(${1:value})"],
    ["hash", "hash(${1:value})"],
    ["int", "int(${1:value})"],
    ["len", "len(${1:collection})"],
    ["list", "list(${1:iterable})"],
    ["map", "map(${1:function}, ${2:iterable})"],
    ["max", "max(${1:iterable})"],
    ["min", "min(${1:iterable})"],
    ["next", "next(${1:iterator})"],
    ["ord", "ord(${1:char})"],
    ["pow", "pow(${1:base}, ${2:exp})"],
    ["print", "print(${1:value})"],
    ["range", "range(${1:stop})"],
    ["reversed", "reversed(${1:sequence})"],
    ["round", "round(${1:number})"],
    ["set", "set(${1:iterable})"],
    ["sorted", "sorted(${1:iterable})"],
    ["str", "str(${1:value})"],
    ["sum", "sum(${1:iterable})"],
    ["tuple", "tuple(${1:iterable})"],
    ["zip", "zip(${1:iterables})"],
  ];
  const leetcodeHelpers = [
    ["List", "List[${1:int}]", "typing.List"],
    ["Optional", "Optional[${1:TreeNode}]", "typing.Optional"],
    ["Dict", "Dict[${1:str}, ${2:int}]", "typing.Dict"],
    ["Set", "Set[${1:int}]", "typing.Set"],
    ["Tuple", "Tuple[${1:int}, ${2:int}]", "typing.Tuple"],
    ["deque", "deque(${1})", "collections.deque"],
    ["defaultdict", "defaultdict(${1:int})", "collections.defaultdict"],
    ["Counter", "Counter(${1:iterable})", "collections.Counter"],
    ["heapq", "heapq", "heapq module"],
    ["heappush", "heapq.heappush(${1:heap}, ${2:item})", "heapq.heappush"],
    ["heappop", "heapq.heappop(${1:heap})", "heapq.heappop"],
    ["bisect_left", "bisect_left(${1:a}, ${2:x})", "bisect.bisect_left"],
    ["bisect_right", "bisect_right(${1:a}, ${2:x})", "bisect.bisect_right"],
    ["lru_cache", "@lru_cache(None)\ndef ${1:dp}(${2:state}):\n\t${0:pass}", "functools.lru_cache"],
    ["cache", "@cache\ndef ${1:dp}(${2:state}):\n\t${0:pass}", "functools.cache"],
    ["TreeNode", "TreeNode", "LeetCode tree node"],
    ["ListNode", "ListNode", "LeetCode linked-list node"],
  ];
  const imports = [
    ["from typing import ...", "from typing import List, Optional, Dict, Set, Tuple", "Typing imports"],
    ["from collections import ...", "from collections import Counter, defaultdict, deque", "Collections imports"],
    ["from heapq import ...", "from heapq import heappush, heappop, heapify", "Heap imports"],
    ["from bisect import ...", "from bisect import bisect_left, bisect_right", "Bisect imports"],
    ["from functools import ...", "from functools import cache, lru_cache", "Memoization imports"],
  ];
  const dotMembers = [
    ["append", "append(${1:value})", "list.append"],
    ["extend", "extend(${1:iterable})", "list.extend"],
    ["pop", "pop(${1})", "list/dict/set pop"],
    ["sort", "sort()", "list.sort in place"],
    ["reverse", "reverse()", "list.reverse in place"],
    ["copy", "copy()", "shallow copy"],
    ["join", "join(${1:iterable})", "str.join"],
    ["split", "split(${1})", "str.split"],
    ["strip", "strip()", "str.strip"],
    ["startswith", "startswith(${1:prefix})", "str.startswith"],
    ["endswith", "endswith(${1:suffix})", "str.endswith"],
    ["find", "find(${1:sub})", "str.find"],
    ["items", "items()", "dict.items"],
    ["keys", "keys()", "dict.keys"],
    ["values", "values()", "dict.values"],
    ["get", "get(${1:key}, ${2:default})", "dict.get"],
    ["setdefault", "setdefault(${1:key}, ${2:default})", "dict.setdefault"],
    ["add", "add(${1:value})", "set.add"],
    ["remove", "remove(${1:value})", "set.remove"],
    ["discard", "discard(${1:value})", "set.discard"],
    ["popleft", "popleft()", "deque.popleft"],
    ["appendleft", "appendleft(${1:value})", "deque.appendleft"],
  ];
  const snippets = [
    ["def function", "def ${1:function_name}(${2:args}):\n\t${0:pass}", "Function definition"],
    ["class definition", "class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\t${0:pass}", "Class definition"],
    ["if statement", "if ${1:condition}:\n\t${0:pass}", "If statement"],
    ["if / else", "if ${1:condition}:\n\t${2:pass}\nelse:\n\t${0:pass}", "If / else statement"],
    ["if guard continue", "if ${1:condition}:\n\tcontinue", "Guard clause in loop"],
    ["for loop", "for ${1:item} in ${2:iterable}:\n\t${0:pass}", "For loop"],
    ["for range loop", "for ${1:i} in range(${2:n}):\n\t${0:pass}", "For loop with range"],
    ["for enumerate", "for ${1:i}, ${2:value} in enumerate(${3:nums}):\n\t${0:pass}", "Loop with index and value"],
    ["while loop", "while ${1:condition}:\n\t${0:pass}", "While loop"],
    ["while queue", "while ${1:queue}:\n\t${2:node} = ${1:queue}.popleft()\n\t${0:pass}", "BFS queue loop"],
    ["try / except", "try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:error}:\n\t${0:pass}", "Try / except block"],
    ["list comprehension", "[${1:expression} for ${2:item} in ${3:iterable}]", "List comprehension"],
    ["dict comprehension", "{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}", "Dict comprehension"],
    ["two pointers", "${1:left}, ${2:right} = 0, len(${3:nums}) - 1\nwhile ${1:left} < ${2:right}:\n\t${0:pass}", "Two pointer skeleton"],
    ["binary search", "${1:left}, ${2:right} = 0, len(${3:nums}) - 1\nwhile ${1:left} <= ${2:right}:\n\t${4:mid} = (${1:left} + ${2:right}) // 2\n\t${0:pass}", "Binary search skeleton"],
    ["DFS function", "def dfs(${1:node}):\n\tif not ${1:node}:\n\t\treturn ${2:None}\n\t${0:pass}", "DFS helper"],
    ["BFS queue", "q = deque([${1:start}])\nwhile q:\n\t${2:node} = q.popleft()\n\t${0:pass}", "BFS with deque"],
    ["heap pattern", "heap = []\nheappush(heap, ${1:item})\n${2:item} = heappop(heap)", "Min-heap pattern"],
    ["memoized dp", "@lru_cache(None)\ndef dp(${1:i}):\n\t${0:pass}", "Memoized DP helper"],
    ["LeetCode Solution", "class Solution:\n\tdef ${1:method}(self, ${2:args}):\n\t\t${0:pass}", "LeetCode Solution class"],
  ];
  const ignoredLocalNames = new Set([
    "self", "cls", "True", "False", "None", "and", "or", "not", "in", "is",
    "if", "else", "elif", "for", "while", "return", "def", "class", "with",
    "as", "try", "except", "finally", "import", "from", "pass", "break", "continue",
  ]);
  const localNamePattern = /^[A-Za-z_]\w*$/;

  function cleanPythonName(raw) {
    const name = String(raw || "")
      .trim()
      .replace(/^\*+/, "")
      .split("=")[0]
      .split(":")[0]
      .trim();
    return localNamePattern.test(name) && !ignoredLocalNames.has(name) ? name : "";
  }

  function addNamesFromTarget(target, addName) {
    String(target || "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\([^)]*\)/g, "")
      .split(",")
      .map(cleanPythonName)
      .filter(Boolean)
      .forEach(addName);
  }

  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [".", "_"],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const lineBeforeCursor = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
      const currentLine = position.lineNumber;
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const suggestions = [];
      const addSnippet = ([label, insertText, detail], priority = 0) => suggestions.push({
        label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail,
        sortText: `${priority}-${label}`,
      });
      const addFunction = ([name, insertText, detail], priority = 1) => suggestions.push({
        label: name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail: detail || (lang === "vi" ? "Hàm dựng sẵn Python" : "Python built-in function"),
        sortText: `${priority}-${name}`,
      });
      const addLocalFunction = (fn, priority = 0) => suggestions.push({
        label: fn.name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: `${fn.name}(${fn.params.map((param, index) => `\${${index + 1}:${param}}`).join(", ")})`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail: lang === "vi" ? "Hàm đã khai báo trong editor" : "Function declared in this editor",
        documentation: `def ${fn.name}(${fn.rawParams.join(", ")})`,
        sortText: `${priority}-${fn.name}`,
      });
      const addLocalVariable = (item, priority = 0) => suggestions.push({
        label: item.name,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: item.name,
        range,
        detail: item.detail || (lang === "vi" ? "Biến đã khai báo trong editor" : "Variable declared in this editor"),
        documentation: item.source ? `${item.source} · line ${item.lineNumber}` : undefined,
        sortText: `${priority}-${String(item.lineNumber).padStart(4, "0")}-${item.name}`,
      });

      const declaredFunctions = [];
      const declaredVariables = [];
      const seenFunctionNames = new Set();
      const seenVariableNames = new Set();
      const functionPattern = /^(\s*)def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:/;
      let activeFunction = null;
      for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber += 1) {
        const line = model.getLineContent(lineNumber);
        if (lineNumber === currentLine && /^\s*def\b/.test(line)) continue;
        const match = line.match(functionPattern);
        if (!match) continue;
        const name = match[2];
        if (seenFunctionNames.has(name)) continue;
        seenFunctionNames.add(name);
        const rawParams = match[3]
          .split(",")
          .map((param) => param.trim())
          .filter(Boolean);
        const params = rawParams
          .map((param) => param.split("=")[0].split(":")[0].trim().replace(/^\*+/, ""))
          .filter((param) => param && param !== "self" && param !== "cls");
        declaredFunctions.push({ name, rawParams, params, indent: match[1].length, lineNumber });
        if (lineNumber <= currentLine && (!activeFunction || lineNumber > activeFunction.lineNumber)) {
          activeFunction = { name, rawParams, params, indent: match[1].length, lineNumber };
        }
      }

      function rememberVariable(name, lineNumber, source, detail) {
        if (!name || seenVariableNames.has(name)) return;
        seenVariableNames.add(name);
        declaredVariables.push({ name, lineNumber, source, detail });
      }

      if (activeFunction) {
        activeFunction.params.forEach((param) => {
          rememberVariable(
            param,
            activeFunction.lineNumber,
            `def ${activeFunction.name}(${activeFunction.rawParams.join(", ")})`,
            lang === "vi" ? "Tham số của function hiện tại" : "Parameter of the current function",
          );
        });
      }

      for (let lineNumber = 1; lineNumber < currentLine; lineNumber += 1) {
        const rawLine = model.getLineContent(lineNumber);
        const codeLine = rawLine.replace(/#.*/, "");
        if (!codeLine.trim()) continue;
        const indent = (codeLine.match(/^\s*/) || [""])[0].length;
        if (activeFunction && lineNumber > activeFunction.lineNumber && indent <= activeFunction.indent) break;

        const addVariableFromLine = (name, source, detail) => rememberVariable(name, lineNumber, source, detail);
        const forMatch = codeLine.match(/^\s*(?:async\s+)?for\s+(.+?)\s+in\s+.+:/);
        if (forMatch) {
          addNamesFromTarget(forMatch[1], (name) => addVariableFromLine(
            name,
            codeLine.trim(),
            lang === "vi" ? "Biến vòng lặp đã khai báo" : "Loop variable declared earlier",
          ));
        }

        const withMatch = codeLine.match(/^\s*with\s+.+?\s+as\s+([A-Za-z_]\w*)\s*:/);
        if (withMatch) {
          addVariableFromLine(withMatch[1], codeLine.trim(), lang === "vi" ? "Biến từ with/as" : "Variable from with/as");
        }

        const exceptMatch = codeLine.match(/^\s*except\b.*?\s+as\s+([A-Za-z_]\w*)\s*:/);
        if (exceptMatch) {
          addVariableFromLine(exceptMatch[1], codeLine.trim(), lang === "vi" ? "Biến exception" : "Exception variable");
        }

        const importMatch = codeLine.match(/^\s*import\s+(.+)/);
        if (importMatch) {
          importMatch[1].split(",").forEach((part) => {
            const pieces = part.trim().split(/\s+as\s+/);
            const alias = pieces[1] || pieces[0].split(".")[0];
            addVariableFromLine(cleanPythonName(alias), codeLine.trim(), lang === "vi" ? "Tên import đã khai báo" : "Imported name");
          });
        }

        const fromImportMatch = codeLine.match(/^\s*from\s+\S+\s+import\s+(.+)/);
        if (fromImportMatch) {
          fromImportMatch[1].split(",").forEach((part) => {
            const pieces = part.trim().split(/\s+as\s+/);
            const imported = pieces[1] || pieces[0];
            addVariableFromLine(cleanPythonName(imported), codeLine.trim(), lang === "vi" ? "Tên import đã khai báo" : "Imported name");
          });
        }

        const assignmentMatch = codeLine.match(/^\s*([^=<>!]+?)\s*(?::=[^=]|=(?!=))/);
        if (assignmentMatch && !/^\s*(if|elif|while|return|assert)\b/.test(codeLine)) {
          addNamesFromTarget(assignmentMatch[1], (name) => addVariableFromLine(
            name,
            codeLine.trim(),
            lang === "vi" ? "Biến đã gán trước đó" : "Assigned earlier",
          ));
        }
      }

      if (lineBeforeCursor.endsWith(".")) {
        dotMembers.forEach((item) => addFunction(item, 0));
        return { suggestions };
      }

      const inImportLine = /^\s*(from|import)\b/.test(lineBeforeCursor);
      if (inImportLine || lineBeforeCursor.trim() === "") {
        imports.forEach((item) => addSnippet(item, 0));
      }

      if (/^\s*for\b/.test(lineBeforeCursor)) {
        [
          ["range(len(...))", "range(len(${1:nums}))", "Loop over indices"],
          ["enumerate(...)", "enumerate(${1:nums})", "Loop over index and value"],
        ].forEach((item) => addSnippet(item, 0));
      }
      if (/^\s*if\b/.test(lineBeforeCursor)) {
        [
          ["not empty", "${1:arr}", "Truthy collection check"],
          ["bounds check", "0 <= ${1:i} < ${2:n}", "Index bounds check"],
          ["visited check", "${1:node} not in ${2:visited}", "Graph/tree visited guard"],
        ].forEach((item) => addSnippet(item, 0));
      }

      declaredVariables.forEach((item) => addLocalVariable(item, 0));
      declaredFunctions.forEach((fn) => addLocalFunction(fn, 0));
      snippets.forEach((item) => addSnippet(item, 1));
      leetcodeHelpers.forEach((item) => addFunction(item, 2));
      builtins.forEach((item) => addFunction(item, 3));
      keywords.forEach((keyword) => suggestions.push({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range,
        detail: lang === "vi" ? "Từ khóa Python" : "Python keyword",
        sortText: `4-${keyword}`,
      }));
      return { suggestions };
    },
  });
}

function loadPyodideRuntime() {
  if (pyodideLoadPromise) return pyodideLoadPromise;
  pyodideLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    script.onload = async () => {
      try {
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
        });
        resolve(pyodide);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Pyodide from CDN"));
    document.head.appendChild(script);
  });
  return pyodideLoadPromise;
}

function selectedLiveCodeBlock() {
  const approachInput = $("extraParams") && $("extraParams").querySelector('[data-param="approach"]');
  const selected = approachInput ? Number(approachInput.value) : 1;
  if (selected === 3 && problemData && problemData.code3) return 3;
  if (selected === 2 && problemData && problemData.code2) return 2;
  return 1;
}

function currentLiveSourceKey() {
  return `${currentProblemId || "none"}:${selectedLiveCodeBlock()}`;
}

function currentPrimaryCode() {
  const codeBlock = selectedLiveCodeBlock();
  if (codeBlock === 3) return (problemData.code3 || []).join("\n");
  if (codeBlock === 2) return (problemData.code2 || []).join("\n");
  const localizedCode = problemData && (lang === "vi" ? problemData.codeVi : problemData.codeEn);
  return (localizedCode || (problemData && problemData.code) || []).join("\n");
}

function clearedSolutionSkeleton(sourceCode) {
  const code = String(sourceCode || "");
  const classMatch = code.match(/^([ \t]*)class\s+Solution\s*:[ \t]*(?:#.*)?$/m);
  if (!classMatch) return "class Solution:\n    ";

  const classIndent = classMatch[1] || "";
  const afterClass = code.slice(classMatch.index + classMatch[0].length);
  const methodMatch = afterClass.match(/\n([ \t]+)def\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*(?:->[^\n:]+)?\s*:[ \t]*(?:#.*)?/);
  if (!methodMatch) return `${classIndent}class Solution:\n${classIndent}    `;

  const methodIndent = methodMatch[1];
  const methodName = methodMatch[2];
  const args = methodMatch[3].trim();
  const bodyIndent = `${methodIndent}    `;
  return `${classIndent}class Solution:\n${methodIndent}def ${methodName}(${args}):\n${bodyIndent}`;
}

async function collectLiveCallArgs() {
  // Re-use the same input/params the canned visualizer already validated.
  const isString = problemData && problemData.inputKind === "string";
  const isStringArray = problemData && problemData.inputKind === "stringArray";
  let input;
  if (isString) {
    input = $("arrInput").value.trim();
  } else if (isStringArray) {
    const raw = $("arrInput").value.trim();
    input = raw.startsWith("[") ? JSON.parse(raw) : raw.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    input = $("arrInput").value.trim().split(",").map((s) => s.trim()).filter((s) => s !== "").map(Number);
  }
  const params = {};
  $("extraParams").querySelectorAll("[data-param]").forEach((inp) => {
    params[inp.dataset.param] = inp.dataset.type === "string" ? inp.value : Number(inp.value);
  });

  const res = await fetch(`/api/problem/${currentProblemId}/live-args`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, params, codeBlock: selectedLiveCodeBlock() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not prepare arguments");
  return data;
}

async function ensureMonacoEditor() {
  const sourceKey = currentLiveSourceKey();
  if (monacoEditorInstance) {
    if (monacoSourceKey !== sourceKey) {
      monacoEditorInstance.setValue(currentPrimaryCode());
      monacoSourceKey = sourceKey;
    }
    monacoEditorInstance.layout();
    return monacoEditorInstance;
  }
  $("liveStatus").textContent = lt().loading;
  const monaco = await loadMonaco();
  registerMonacoThemes(monaco);
  registerPythonCompletions(monaco);
  const isLight = document.documentElement.dataset.theme !== "dark";
  monacoEditorInstance = monaco.editor.create($("monacoEditor"), {
    value: currentPrimaryCode(),
    language: "python",
    theme: isLight ? "leetcode-python-light" : "leetcode-python-dark",
    fontFamily: '"Cascadia Code", "JetBrains Mono", "SFMono-Regular", Consolas, Menlo, monospace',
    fontLigatures: false,
    fontSize: 14,
    lineHeight: 21,
    wordWrap: "on",
    wrappingIndent: "same",
    wrappingStrategy: "advanced",
    scrollbar: {
      horizontal: "hidden",
      horizontalScrollbarSize: 0,
      vertical: "auto",
      verticalScrollbarSize: 10,
    },
    minimap: { enabled: false },
    automaticLayout: true,
    fixedOverflowWidgets: true,
    // Monaco's sticky header uses a separate default font and can look
    // inconsistent near the end of long solutions, so keep one code surface.
    stickyScroll: { enabled: false },
    scrollBeyondLastLine: false,
    renderLineHighlight: "all",
    renderWhitespace: "selection",
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    smoothScrolling: true,
    matchBrackets: "always",
    bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
    guides: { indentation: true, highlightActiveIndentation: true, bracketPairs: true },
    padding: { top: 10, bottom: 10 },
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
    quickSuggestions: { other: true, comments: false, strings: false },
    quickSuggestionsDelay: 80,
    suggestOnTriggerCharacters: true,
    snippetSuggestions: "top",
    tabCompletion: "on",
    wordBasedSuggestions: "currentDocument",
    parameterHints: { enabled: true },
  });
  monacoSourceKey = sourceKey;
  $("liveStatus").textContent = "";
  monacoEditorInstance.layout();
  return monacoEditorInstance;
}

function initLiveEditorResize() {
  if (liveResizeInitialized) return;
  const wrap = $("liveEditorWrap");
  const editorHost = $("monacoEditor");
  const handle = $("liveResizeHandle");
  if (!wrap || !editorHost || !handle) return;
  liveResizeInitialized = true;

  const storageKey = "leetcode-live-editor-size";
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function applySize(width, height) {
    const parentWidth = wrap.parentElement ? wrap.parentElement.clientWidth : window.innerWidth;
    const nextWidth = clamp(width, Math.min(280, parentWidth), parentWidth);
    const nextHeight = clamp(height, 220, Math.max(360, Math.round(window.innerHeight * 0.78)));
    wrap.style.setProperty("--live-editor-width", `${Math.round(nextWidth)}px`);
    wrap.style.setProperty("--live-editor-height", `${Math.round(nextHeight)}px`);
    if (monacoEditorInstance) monacoEditorInstance.layout();
    return { width: nextWidth, height: nextHeight };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved && Number.isFinite(saved.height)) {
      applySize(wrap.parentElement ? wrap.parentElement.clientWidth : window.innerWidth, saved.height);
    }
  } catch (_) {
    localStorage.removeItem(storageKey);
  }

  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = wrap.getBoundingClientRect().width;
    const startHeight = editorHost.getBoundingClientRect().height;
    wrap.classList.add("is-resizing");
    handle.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const size = applySize(startWidth + moveEvent.clientX - startX, startHeight + moveEvent.clientY - startY);
      localStorage.setItem(storageKey, JSON.stringify({ height: size.height }));
    };
    const onEnd = (endEvent) => {
      wrap.classList.remove("is-resizing");
      if (handle.hasPointerCapture(endEvent.pointerId)) handle.releasePointerCapture(endEvent.pointerId);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onEnd);
      handle.removeEventListener("pointercancel", onEnd);
    };

    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onEnd);
    handle.addEventListener("pointercancel", onEnd);
  });

  handle.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const currentWidth = wrap.getBoundingClientRect().width;
    const currentHeight = editorHost.getBoundingClientRect().height;
    const size = applySize(currentWidth, currentHeight + 60);
    localStorage.setItem(storageKey, JSON.stringify({ height: size.height }));
  });
}

function setLiveEditorLayoutMode(on) {
  const wrap = $("liveEditorWrap");
  const split = wrap && wrap.closest(".viz-split");
  if (split) split.classList.toggle("live-editing", on);
  if (wrap && on) wrap.style.setProperty("--live-editor-width", "100%");
  if (monacoEditorInstance) requestAnimationFrame(() => monacoEditorInstance.layout());
}

async function ensurePyodide() {
  if (pyodideInstance) return pyodideInstance;
  $("liveStatus").textContent = lt().loading;
  pyodideInstance = await loadPyodideRuntime();
  return pyodideInstance;
}

// Python-side tracer: wraps the user's Solution class so that calling its
// public method records (line, locals-snapshot) for every executed line,
// then returns both the trace and the return value to JS.
const TRACER_PY = `
import sys, json, math, heapq, io, contextlib, collections, bisect, functools, itertools
from collections import Counter, defaultdict, deque
from typing import List, Optional, Dict, Set, Tuple
from functools import cache, lru_cache
from bisect import bisect_left, bisect_right
from itertools import accumulate
from math import gcd

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

    def __repr__(self):
        return f"TreeNode(val={self.val})"

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

    def __repr__(self):
        return f"ListNode(val={self.val})"

class Node:
    def __init__(self, val=0, next=None, random=None, child=None, neighbors=None, left=None, right=None, parent=None):
        self.val = val
        self.next = next
        self.random = random
        self.child = child
        self.neighbors = neighbors if neighbors is not None else []
        self.left = left
        self.right = right
        self.parent = parent

    def __repr__(self):
        return f"Node(val={self.val})"

class HtmlParser:
    def __init__(self, edges):
        self.graph = defaultdict(list)
        for source, target in edges:
            self.graph[source].append(target)

    def getUrls(self, url):
        return self.graph.get(url, [])

class Employee:
    def __init__(self, id, importance, subordinates):
        self.id = id
        self.importance = importance
        self.subordinates = subordinates

    def __repr__(self):
        return f"Employee(id={self.id}, importance={self.importance})"

def __viz_build_list(values):
    dummy = ListNode()
    tail = dummy
    for item in values:
        tail.next = ListNode(item)
        tail = tail.next
    return dummy.next

def __viz_build_tree(values):
    if not values or values[0] is None:
        return None, []
    root = TreeNode(values[0])
    nodes = [root]
    queue = deque([root])
    index = 1
    while queue and index < len(values):
        parent = queue.popleft()
        if index < len(values) and values[index] is not None:
            parent.left = TreeNode(values[index])
            nodes.append(parent.left)
            queue.append(parent.left)
        index += 1
        if index < len(values) and values[index] is not None:
            parent.right = TreeNode(values[index])
            nodes.append(parent.right)
            queue.append(parent.right)
        index += 1
    return root, nodes

def __viz_build_node_tree(values, with_parent=False):
    if not values or values[0] is None:
        return None, []
    root = Node(values[0])
    nodes = [root]
    queue = deque([root])
    index = 1
    while queue and index < len(values):
        parent = queue.popleft()
        if index < len(values) and values[index] is not None:
            parent.left = Node(values[index], parent=parent if with_parent else None)
            nodes.append(parent.left)
            queue.append(parent.left)
        index += 1
        if index < len(values) and values[index] is not None:
            parent.right = Node(values[index], parent=parent if with_parent else None)
            nodes.append(parent.right)
            queue.append(parent.right)
        index += 1
    return root, nodes

def __viz_materialize(value, context=None, namespace=None):
    """Convert JSON-safe live arguments into LeetCode helper objects."""
    if context is None:
        context = {}
    if namespace is None:
        namespace = globals()
    if isinstance(value, dict) and value.get("__viz_type") == "binary_tree":
        values = value.get("values", [])
        root, nodes = __viz_build_tree(values)
        context["tree:" + value.get("tree_id", "root")] = (root, nodes)
        return root
    if isinstance(value, dict) and value.get("__viz_type") == "binary_tree_next":
        root, nodes = __viz_build_node_tree(value.get("values", []))
        context["tree:" + value.get("tree_id", "root")] = (root, nodes)
        return root
    if isinstance(value, dict) and value.get("__viz_type") in ("binary_tree_ref", "binary_tree_refs"):
        _root, nodes = context.get("tree:" + value.get("tree_id", "root"), (None, []))
        wanted = value.get("values", []) if value.get("__viz_type") == "binary_tree_refs" else [value.get("value")]
        matches = []
        for target in wanted:
            matches.append(next((node for node in nodes if node.val == target), None))
        return matches if value.get("__viz_type") == "binary_tree_refs" else matches[0]
    if isinstance(value, dict) and value.get("__viz_type") == "linked_list":
        return __viz_build_list(value.get("values", []))
    if isinstance(value, dict) and value.get("__viz_type") == "employee_list":
        employees = []
        for entry in value.get("values", []):
            if isinstance(entry, dict):
                employees.append(Employee(entry.get("id"), entry.get("importance"), list(entry.get("subordinates", []))))
            else:
                employees.append(Employee(entry[0], entry[1], list(entry[2])))
        return employees
    if isinstance(value, dict) and value.get("__viz_type") == "graph_node":
        nodes = {index: Node(index) for index in range(1, value.get("n", 0) + 1)}
        for left, right in value.get("edges", []):
            nodes[left].neighbors.append(nodes[right])
            nodes[right].neighbors.append(nodes[left])
        return nodes.get(value.get("start"))
    if isinstance(value, dict) and value.get("__viz_type") == "random_list":
        entries = value.get("entries", [])
        nodes = [Node(entry[0]) for entry in entries]
        for index, node in enumerate(nodes):
            node.next = nodes[index + 1] if index + 1 < len(nodes) else None
            random_index = entries[index][1]
            node.random = nodes[random_index] if 0 <= random_index < len(nodes) else None
        return nodes[0] if nodes else None
    if isinstance(value, dict) and value.get("__viz_type") == "multilevel_list":
        def make_chain(values):
            nodes = [Node(item) for item in values]
            for index, node in enumerate(nodes):
                node.prev = nodes[index - 1] if index else None
                node.next = nodes[index + 1] if index + 1 < len(nodes) else None
            return nodes
        top = make_chain(value.get("values", []))
        by_value = {node.val: node for node in top}
        for group in str(value.get("children", "")).split(";"):
            if not group or ":" not in group:
                continue
            parent_value, children_text = group.split(":", 1)
            children = make_chain([int(item) for item in children_text.split(",") if item])
            if children and int(parent_value) in by_value:
                by_value[int(parent_value)].child = children[0]
                by_value.update({node.val: node for node in children})
        return top[0] if top else None
    if isinstance(value, dict) and value.get("__viz_type") == "html_parser":
        return HtmlParser(value.get("edges", []))
    if isinstance(value, dict) and value.get("__viz_type") == "parent_tree_ref":
        root, nodes = __viz_build_node_tree(value.get("values", []), True)
        context["tree:" + value.get("tree_id", "parent_tree")] = (root, nodes)
        return next((node for node in nodes if node.val == value.get("value")), None)
    if isinstance(value, dict) and value.get("__viz_type") == "parent_tree_existing_ref":
        _root, nodes = context.get("tree:" + value.get("tree_id", "parent_tree"), (None, []))
        return next((node for node in nodes if node.val == value.get("value")), None)
    if isinstance(value, dict) and value.get("__viz_type") == "previous_result":
        return context.get("previous_result")
    if isinstance(value, dict) and value.get("__viz_type") == "intersecting_lists":
        values_a = value.get("head_a", [])
        values_b = value.get("head_b", [])
        intersection = value.get("intersection")
        index_a = next((i for i, item in enumerate(values_a) if item == intersection), len(values_a))
        index_b = next((i for i, item in enumerate(values_b) if item == intersection), len(values_b))
        shared = __viz_build_list(values_a[index_a:])
        def with_shared(prefix):
            head = __viz_build_list(prefix)
            if head is None:
                return shared
            tail = head
            while tail.next:
                tail = tail.next
            tail.next = shared
            return head
        heads = (with_shared(values_a[:index_a]), with_shared(values_b[:index_b]))
        context["intersecting_lists"] = heads
        return heads[0]
    if isinstance(value, dict) and value.get("__viz_type") == "intersecting_lists_ref":
        heads = context.get("intersecting_lists", (None, None))
        return heads[1] if value.get("head") == "b" else heads[0]
    if isinstance(value, dict) and value.get("__viz_type") == "design_instance":
        class_name = value.get("className", value.get("class_name"))
        if not isinstance(class_name, str) or not class_name:
            raise RuntimeError("A design_instance marker requires a className.")
        instance_class = namespace.get(class_name)
        if instance_class is None:
            raise RuntimeError(f"Class '{class_name}' was not found for a design_instance marker.")
        constructor_values = value.get("constructorArgs", value.get("args", []))
        if constructor_values is None:
            constructor_values = []
        elif not isinstance(constructor_values, (list, tuple)):
            constructor_values = [constructor_values]
        constructor_args = [__viz_materialize(item, context, namespace) for item in constructor_values]
        return instance_class(*constructor_args)
    if isinstance(value, list):
        return [__viz_materialize(item, context, namespace) for item in value]
    if isinstance(value, tuple):
        return tuple(__viz_materialize(item, context, namespace) for item in value)
    if isinstance(value, dict):
        return {key: __viz_materialize(item, context, namespace) for key, item in value.items()}
    return value

def __viz_run_trace(user_code, method_name, call_args, design_config=None):
    trace = []
    stdout_buffer = io.StringIO()

    def safe_repr(value, depth=0):
        try:
            if depth > 3:
                return "..."
            if isinstance(value, (int, float, str, bool)) or value is None:
                if isinstance(value, float) and (math.isinf(value) or math.isnan(value)):
                    return repr(value)
                return value
            if isinstance(value, (list, tuple)):
                return [safe_repr(v, depth + 1) for v in value[:200]]
            if isinstance(value, dict):
                return {str(k): safe_repr(v, depth + 1) for k, v in list(value.items())[:200]}
            if isinstance(value, set):
                return [safe_repr(v, depth + 1) for v in list(value)[:200]]
            return repr(value)
        except Exception:
            return "<unrepr>"

    def tracer(frame, event, arg):
        try:
            code = frame.f_code
            if code.co_filename != "<usercode>":
                return None
            if event == "line":
                snapshot = {}
                for k, v in frame.f_locals.items():
                    if k == "self":
                        continue
                    snapshot[k] = safe_repr(v)
                trace.append({"line": frame.f_lineno, "vars": snapshot, "stdout": stdout_buffer.getvalue()})
            elif event == "return" and code.co_name == method_name:
                # A line event fires before that line executes. Capture the
                # public method's return as well so the final step shows
                # mutations made by its last line (for example, a tree swap).
                snapshot = {}
                for k, v in frame.f_locals.items():
                    if k == "self":
                        continue
                    snapshot[k] = safe_repr(v)
                trace.append({"line": frame.f_lineno, "vars": snapshot, "stdout": stdout_buffer.getvalue()})
            elif event == "call":
                return tracer
        except Exception:
            pass
        return tracer

    user_code = user_code.encode("utf-8", "replace").decode("utf-8")
    compiled = compile(user_code, "<usercode>", "exec")
    # Seed common LeetCode helper names so snippets that omit their own
    # imports (as shown in the problem's code panel) still run.
    ns2 = {
        "heapq": heapq,
        "Counter": Counter,
        "defaultdict": defaultdict,
        "deque": deque,
        "List": List,
        "Optional": Optional,
        "Dict": Dict,
        "Set": Set,
        "Tuple": Tuple,
        "math": math,
        "collections": collections,
        "bisect": bisect,
        "functools": functools,
        "itertools": itertools,
        "cache": cache,
        "lru_cache": lru_cache,
        "bisect_left": bisect_left,
        "bisect_right": bisect_right,
        "accumulate": accumulate,
        "gcd": gcd,
        "TreeNode": TreeNode,
        "ListNode": ListNode,
        "Node": Node,
        "HtmlParser": HtmlParser,
        "Employee": Employee,
    }
    exec(compiled, ns2)
    sys.settrace(tracer)
    try:
        materialize_context = {}
        with contextlib.redirect_stdout(stdout_buffer):
            if design_config:
                if design_config.get("functionName"):
                    function2 = ns2.get(design_config["functionName"])
                    if function2 is None:
                        raise RuntimeError(f"Function '{design_config['functionName']}' was not found.")
                    materialized_args = [__viz_materialize(value, materialize_context, ns2) for value in design_config.get("args", [])]
                    result = function2(*materialized_args)
                else:
                    class2 = ns2.get(design_config.get("className"))
                    if class2 is None:
                        raise RuntimeError(f"Class '{design_config.get('className')}' was not found.")
                    constructor_args = [__viz_materialize(value, materialize_context, ns2) for value in design_config.get("constructorArgs", [])]
                    instance2 = class2(*constructor_args)
                    result = []
                    for operation in design_config.get("operations", []):
                        operation_args = [__viz_materialize(value, materialize_context, ns2) for value in operation.get("args", [])]
                        operation_result = getattr(instance2, operation["name"])(*operation_args)
                        materialize_context["previous_result"] = operation_result
                        result.append(operation_result)
                    if design_config.get("resultMode") == "last":
                        result = result[-1] if result else None
            else:
                Solution2 = ns2.get("Solution")
                if Solution2 is None:
                    raise RuntimeError("No 'class Solution' found in the code.")
                instance2 = Solution2()
                method2 = getattr(instance2, method_name, None)
                if method2 is None:
                    raise RuntimeError(f"Solution has no method '{method_name}'.")
                materialized_args = [__viz_materialize(value, materialize_context, ns2) for value in call_args]
                result = method2(*materialized_args)
    finally:
        sys.settrace(None)

    return {"trace": trace, "result": safe_repr(result), "stdout": stdout_buffer.getvalue()}
`;

async function runLiveCode() {
  hide("liveError");
  $("liveStatus").textContent = lt().running;
  try {
    const editor = await ensureMonacoEditor();
    const userCode = editor.getValue();
    const liveCall = await collectLiveCallArgs();
    const args = liveCall.args || [];
    const design = liveCall.design || null;
    const pyodide = await ensurePyodide();

    if (!pyodide.__viz_tracer_loaded) {
      pyodide.runPython(TRACER_PY);
      pyodide.__viz_tracer_loaded = true;
    }

    // Infer the public method name from the code itself (first "def X(self" after "class Solution").
    const methodMatch = userCode.match(/class\s+Solution\b[\s\S]*?def\s+(\w+)\s*\(\s*self/);
    if (!methodMatch && !design) {
      throw new Error(lang === "vi" ? "Không tìm thấy 'class Solution' với 1 phương thức nhận self." : "Could not find a 'class Solution' with a method taking self.");
    }
    const methodName = methodMatch ? methodMatch[1] : (design.functionName || design.className || "design");

    pyodide.globals.set("__viz_user_code", userCode);
    pyodide.globals.set("__viz_method_name", methodName);
    pyodide.globals.set("__viz_call_args", pyodide.toPy(args));
    pyodide.globals.set("__viz_design", design ? pyodide.toPy(design) : null);

    const runFn = pyodide.globals.get("__viz_run_trace");
    const resultProxy = runFn(
      pyodide.globals.get("__viz_user_code"),
      methodName,
      pyodide.globals.get("__viz_call_args"),
      pyodide.globals.get("__viz_design"),
    );
    const resultJs = resultProxy.toJs({ dict_converter: Object.fromEntries });
    resultProxy.destroy && resultProxy.destroy();

    const rawTrace = resultJs.trace || [];
    liveSteps = rawTrace.map((entry, idx) => ({
      line: entry.line,
      vars: entry.vars || {},
      stdout: entry.stdout || "",
      isLast: idx === rawTrace.length - 1,
    }));
    const answer = resultJs.result;

    if (liveSteps.length === 0) {
      $("liveStatus").textContent = lt().doneNoTrace;
    } else {
      $("liveStatus").textContent = lt().ready(liveSteps.length);
    }

    enterLiveStepMode(userCode, answer);
  } catch (err) {
    $("liveStatus").textContent = "";
    showRichError("liveError", formatPythonRuntimeError(err));
  }
}

// Replace the normal canned-animation step list with the real traced run,
// reusing the existing controls (Prev/Next/Play) and code-highlight logic.
function enterLiveStepMode(userCode, answer) {
  const userLines = userCode.split("\n");
  steps = liveSteps.map((s) => ({
    title: { vi: `Dòng ${s.line}`, en: `Line ${s.line}` },
    codeLines: [s.line],
    vars: Object.entries(s.vars).map(([name, value]) => ({ name, value: formatLiveValue(value) })),
    stdout: s.stdout,
    note: { vi: "", en: "" },
    final: s.isLast,
    __live: true,
  }));
  answerValue = formatLiveValue(answer);
  stepIndex = 0;
  resetBreakpoints();
  renderLiveCodePanel(userLines);
  // Collapse Monaco and show the read-only highlighted trace. This is still
  // live mode, so keep only "Exit editor" visible in the mode bar.
  setLiveEditorLayoutMode(false);
  $("liveEditorWrap").classList.add("hidden");
  $("codePanel").classList.remove("hidden");
  $("liveEditBtn").classList.add("hidden");
  renderStep();
}

// Simple, generic right-hand panel for live-run steps: just a clean list of
// the current local variables (mirrors a real debugger's "locals" view).
// This intentionally does not try to guess a specialized visualization
// (heap tree, grid, graph...) since the user's edited code can differ
// arbitrarily from the shape the canned builders expect.
function renderLiveVarsView(step) {
  const el = $("liveVarsView");
  const entries = step.vars || [];
  const varsHtml = entries.length === 0
    ? `<div class="live-vars-empty">${lang === "vi" ? "Chưa có biến local nào tại dòng này." : "No local variables at this line yet."}</div>`
    : `<div class="live-vars-list">${entries.map((v) => `
      <div class="live-var-row">
        <span class="live-var-name">${escapeHtml(v.name)}</span>
        <span class="live-var-value">${escapeHtml(v.value)}</span>
      </div>`).join("")}</div>`;
  const stdout = step.stdout || "";
  const stdoutHtml = stdout
    ? `<pre class="live-console-output">${escapeHtml(stdout)}</pre>`
    : `<div class="live-console-empty">${lang === "vi" ? "Chưa có output ở step này." : "No output at this step yet."}</div>`;
  el.innerHTML = `
    <div class="live-vars-title">${lang === "vi" ? "Biến local (thật, từ Python)" : "Local variables (real, from Python)"}</div>
    ${varsHtml}
    <div class="live-console-panel">
      <div class="live-vars-title">${lang === "vi" ? "Kết quả print()" : "Console output (print)"}</div>
      ${stdoutHtml}
    </div>`;
}

function formatLiveValue(value) {
  if (Array.isArray(value)) return `[${value.map(formatLiveValue).join(", ")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).map(([k, v]) => `${k}: ${formatLiveValue(v)}`).join(", ")}}`;
  }
  if (value === null || value === undefined) return "None";
  return String(value);
}

// Render the user's edited code (read-only, line-numbered) into the same
// #codePanel structure that updateCodeHighlight()/renderVars() expect,
// so stepping through live-run steps highlights lines exactly like the
// canned animations do.
function renderLiveCodePanel(userLines) {
  const panel = $("codePanel");
  panel.innerHTML = "";
  panel.classList.remove("hidden");
  const pyBlock = document.createElement("div");
  pyBlock.className = "code-lang-block";
  pyBlock.dataset.codeLang = "python";
  const section = document.createElement("div");
  section.className = "code-section";
  section.dataset.block = "1";
  userLines.forEach((line, idx) => {
    const row = document.createElement("div");
    row.className = "code-line";
    row.dataset.line = idx + 1;
    const ln = document.createElement("span");
    ln.className = "ln";
    ln.textContent = idx + 1;
    const txt = document.createElement("span");
    txt.className = "txt";
    txt.innerHTML = renderCodeLineHtml(line);
    row.appendChild(ln);
    row.appendChild(txt);
    section.appendChild(row);
  });
  pyBlock.appendChild(section);
  panel.appendChild(pyBlock);
}

// The live editor is opt-in. Loading another problem or starting the normal
// visualization must return to the regular code panel instead of leaving a
// stale Monaco editor (and stale Solution class) visible from the last run.
function resetLiveEditorState() {
  liveMode = false;
  liveSteps = [];
  setCodeSnippetBlurred(readCodeSnippetBlurPreference());
  clearTimeout(liveCopyResetTimer);
  liveCopyResetTimer = null;
  if ($("liveCopyBtn")) {
    setLiveCopyButtonState(false);
  }
  setLiveEditorLayoutMode(false);
  $("liveExitBtn").classList.add("hidden");
  $("liveEditorWrap").classList.add("hidden");
  $("codePanel").classList.remove("hidden");
  $("liveEditBtn").classList.remove("hidden");
  $("codeBlurBtn").classList.remove("hidden");
  $("liveVarsView").classList.add("hidden");
  hide("liveError");
  $("liveStatus").textContent = "";
}

function setLiveMode(on) {
  liveMode = on;
  setLiveEditorLayoutMode(on);
  $("liveEditBtn").classList.toggle("hidden", on);
  $("codeBlurBtn").classList.toggle("hidden", on);
  $("liveExitBtn").classList.toggle("hidden", !on);
  $("liveEditorWrap").classList.toggle("hidden", !on);
  $("codePanel").classList.toggle("hidden", on);
  if (!on) {
    setCodeSnippetBlurred(readCodeSnippetBlurPreference());
    // Restore the canned visualization exactly as it was before entering live mode.
    renderCode();
    if (problemData) {
      // Re-run the last canned solve so the right-hand visualization comes back.
      runViz();
    }
  }
}

function updateCodeBlurButton() {
  const button = $("codeBlurBtn");
  if (!button) return;
  const label = codeSnippetBlurred ? t().codeRevealBtn : t().codeBlurBtn;
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", String(codeSnippetBlurred));
  button.dataset.tooltip = label;
}

function readCodeSnippetBlurPreference() {
  return localStorage.getItem(CODE_SNIPPET_BLURRED_KEY) !== "false";
}

function setCodeSnippetBlurred(on, persist = false) {
  codeSnippetBlurred = Boolean(on);
  const panel = $("codePanel");
  if (panel) panel.classList.toggle("is-blurred", codeSnippetBlurred);
  if (persist) localStorage.setItem(CODE_SNIPPET_BLURRED_KEY, String(codeSnippetBlurred));
  updateCodeBlurButton();
}

$("codeBlurBtn") && $("codeBlurBtn").addEventListener("click", () => {
  setCodeSnippetBlurred(!codeSnippetBlurred, true);
});

$("liveEditBtn") && $("liveEditBtn").addEventListener("click", async () => {
  setCodeSnippetBlurred(false);
  setLiveMode(true);
  try {
    await ensureMonacoEditor();
  } catch (err) {
    showError("liveError", (err && err.message) || String(err));
  }
});

$("liveExitBtn") && $("liveExitBtn").addEventListener("click", () => {
  setLiveMode(false);
});

// Pressing ESC while the live editor is open behaves like clicking "Exit editor".
// Monaco handles ESC for its own widgets (suggest/find) and stops propagation,
// so this only fires when no such widget intercepts the key first.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !liveMode) return;
  const exitButton = $("liveExitBtn");
  if (!exitButton || exitButton.classList.contains("hidden")) return;
  e.preventDefault();
  exitButton.click();
});

$("liveRunBtn") && $("liveRunBtn").addEventListener("click", runLiveCode);

function setLiveCopyButtonState(copied) {
  const button = $("liveCopyBtn");
  if (!button) return;
  button.classList.toggle("copied", copied);
  const label = copied ? lt().copied : t().liveCopyBtn;
  button.setAttribute("aria-label", label);
  button.title = label;
}

async function copyLiveEditorCode() {
  const button = $("liveCopyBtn");
  if (!button) return;
  try {
    const editor = await ensureMonacoEditor();
    const code = editor.getValue();
    let copied = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(code);
        copied = true;
      } catch (_clipboardError) {
        copied = false;
      }
    }
    if (!copied) {
      const fallback = document.createElement("textarea");
      fallback.value = code;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.appendChild(fallback);
      fallback.select();
      copied = document.execCommand("copy");
      fallback.remove();
      if (!copied) throw new Error("Copy command failed");
    }
    clearTimeout(liveCopyResetTimer);
    setLiveCopyButtonState(true);
    $("liveStatus").textContent = "";
    liveCopyResetTimer = setTimeout(() => {
      setLiveCopyButtonState(false);
    }, 1800);
  } catch (_error) {
    setLiveCopyButtonState(false);
    $("liveStatus").textContent = lt().copyFailed;
  }
}

$("liveCopyBtn") && $("liveCopyBtn").addEventListener("click", copyLiveEditorCode);

$("liveClearBtn") && $("liveClearBtn").addEventListener("click", async () => {
  const editor = await ensureMonacoEditor();
  const skeleton = clearedSolutionSkeleton(editor.getValue() || currentPrimaryCode());
  editor.setValue(skeleton);
  const skeletonLines = skeleton.split("\n");
  const bodyLine = skeletonLines.length;
  editor.setPosition({ lineNumber: bodyLine, column: skeletonLines[bodyLine - 1].length + 1 });
  editor.focus();
  hide("liveError");
  $("liveStatus").textContent = "";
});

$("liveResetBtn") && $("liveResetBtn").addEventListener("click", async () => {
  const editor = await ensureMonacoEditor();
  editor.setValue(currentPrimaryCode());
  monacoSourceKey = currentLiveSourceKey();
  hide("liveError");
  $("liveStatus").textContent = "";
});

initLiveEditorResize();

function renderGoodSubseqView(step) {
  const v = step.goodSubseqView;
  const vi = lang === "vi";
  const chips = (values, repeated = []) => values.length
    ? values.map(value => `<code class="ugs-chip${repeated.includes(value) ? " is-repeat" : ""}">${escapeHtml(value)}</code>`).join("")
    : `<span>${vi ? "Rỗng" : "Empty"} ∅</span>`;
  const tr = v.transition;
  const bits = [...v.chars].map((bit, offset) => {
    const i = v.start + offset;
    return `<div class="ugs-bit${i === v.index ? " is-current" : i < v.index ? " is-read" : ""}"><small>${i}</small><strong>${bit}</strong></div>`;
  }).join("");
  const bucket = (bit, count) => `<section class="ugs-bucket${tr && tr.bit === bit ? " is-updated" : ""}">
    <h3>end${bit} <strong>${count}</strong></h3><p>${vi ? "Bắt đầu bằng 1 · kết thúc bằng" : "Starts with 1 · ends in"} ${bit}</p>
    <div class="ugs-set">${v.buckets ? chips(v.buckets[bit], tr && tr.bit === bit ? tr.repeated : []) : (vi ? "Chỉ hiển thị số đếm khi n > 10" : "Counts only for n > 10")}</div></section>`;
  $("treeView").innerHTML = `<section class="ugs-view" aria-label="${vi ? "Đếm dãy con tốt" : "Good subsequence counts"}">
    <div class="ugs-bits">${v.start ? "…" : ""}${bits}${v.start + v.chars.length < v.length ? "…" : ""}</div>
    ${tr && tr.skipped ? `<p>${vi ? `Đã tính thêm ${tr.skipped} ký tự giữa các bước hiển thị.` : `Computed ${tr.skipped} intervening characters between displayed steps.`}</p>` : ""}
    <div class="ugs-formula">${tr ? `<code>end${tr.bit} ← (${tr.old[0]} + ${tr.old[1]}${tr.bit ? " + 1" : ""}) % MOD = ${tr.bit ? v.end1 : v.end0}</code><p>${tr.bit ? (vi ? "+1 tạo chuỗi đơn 1" : "+1 creates the singleton 1") : (vi ? "Ghi nhận chuỗi đơn 0 riêng: hasZero = 1" : "Record singleton 0 separately: hasZero = 1")}</p>` : `<code>${v.phase === "done" ? "return (end0 + end1 + hasZero) % MOD" : "end0 = end1 = hasZero = 0"}</code>`}</div>
    <div class="ugs-buckets">${bucket(0, v.end0)}${bucket(1, v.end1)}</div>
    ${tr && v.buckets ? `<div class="ugs-replace"><strong>${vi ? "Nhóm cũ đã nằm trong nhóm mới" : "Old bucket is included in the new bucket"}</strong><div class="ugs-set">${chips(tr.previous, tr.repeated)}</div><p>${vi ? "Các chuỗi tô vàng đã được tạo lại. Không cộng chúng lần nữa. Nhóm còn lại giữ nguyên." : "Amber strings were generated again. Do not add them twice. The other bucket stays unchanged."}</p></div>` : ""}
    <div class="ugs-zero"><code>hasZero = ${v.hasZero}</code><span>${v.hasZero ? (vi ? 'Thêm đúng một chuỗi "0"' : 'Include exactly one string "0"') : (vi ? 'Chưa có chuỗi "0"' : 'No string "0" yet')}</span></div>
    <div class="ugs-total"><span>${vi ? "Tổng số dãy con tốt" : "Total good subsequences"}</span><strong>${v.end0} + ${v.end1} + ${v.hasZero} ≡ ${v.total}</strong><small>modulo 1,000,000,007</small></div>
  </section>`;
}

function renderCalendar729View(step) {
  const view = step.calendar729View || {};
  const vi = lang === 'vi';
  const current = Array.isArray(view.current) ? view.current : null;
  const calendar = Array.isArray(view.calendar) ? view.calendar : [];
  const calls = Array.isArray(view.callStates) ? view.callStates : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const minimum = Number(view.minimum || 0);
  const maximum = Number(view.maximum || minimum + 1);
  const span = Math.max(1, maximum - minimum);
  const comparedEntry = Number.isInteger(view.compared) && view.compared >= 0 ? calendar[view.compared] : null;
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const final = view.phase === 'done';
  const rejected = view.phase === 'rejected';
  const accepted = view.phase === 'accepted';
  const phases = (vi
    ? ['Nhận request', 'So với lịch cũ', 'Kết luận overlap', 'Lưu / Trả về']
    : ['Read request', 'Compare old booking', 'Decide overlap', 'Save / Return'])
    .map((label, index) => `<span class="${index < phaseIndex ? 'done' : index === phaseIndex ? 'active' : ''}"><b>${index < phaseIndex ? '✓' : index + 1}</b>${escapeHtml(label)}</span>`).join('');

  const position = (value) => 100 * (value - minimum) / span;
  const rangeBar = (range, state) => {
    if (!Array.isArray(range)) return '';
    const left = Math.max(0, Math.min(100, position(range[0])));
    const width = Math.max(1.2, Math.min(100 - left, 100 * (range[1] - range[0]) / span));
    return `<span class="mc729-bar ${state}" style="left:${left}%;width:${width}%"><i></i></span>`;
  };
  const timelineRow = (range, label, state, detail = '') => `<div class="mc729-timeline-row"><header><strong>${escapeHtml(label)}</strong><span>[${range[0]}, ${range[1]})${detail ? ` · ${escapeHtml(detail)}` : ''}</span></header><div class="mc729-track">${rangeBar(range, state)}</div></div>`;

  const callCards = calls.map((call) => {
    const stateLabel = call.state === 'accepted' ? 'TRUE' : call.state === 'rejected' ? 'FALSE' : call.state === 'current' ? 'CURRENT' : vi ? 'chờ' : 'pending';
    return `<article class="mc729-call ${call.state}"><small>book #${call.index + 1}</small><strong>[${call.range[0]}, ${call.range[1]})</strong><span>${stateLabel}</span></article>`;
  }).join('');

  const boolValue = (value) => value == null ? '?' : value ? 'TRUE' : 'FALSE';
  const conditionA = current && comparedEntry ? `${current[0]} < ${comparedEntry.range[1]}` : 'start < old_end';
  const conditionB = current && comparedEntry ? `${comparedEntry.range[0]} < ${current[1]}` : 'old_start < end';
  const conditions = `<section class="mc729-conditions"><header><strong>${vi ? 'HAI ĐIỀU KIỆN ĐỀU PHẢI TRUE' : 'BOTH CONDITIONS MUST BE TRUE'}</strong><span>overlap = A AND B</span></header><div><article class="${view.activeCheck === 'start' ? 'active' : ''} ${view.checkStart === true ? 'pass' : view.checkStart === false ? 'fail' : ''}"><small>A · request bắt đầu trước old kết thúc</small><b>${escapeHtml(conditionA)}</b><strong>${boolValue(view.checkStart)}</strong></article><i>AND</i><article class="${view.activeCheck === 'end' ? 'active' : ''} ${view.checkEnd === true ? 'pass' : view.checkEnd === false ? 'fail' : ''}"><small>B · old bắt đầu trước request kết thúc</small><b>${escapeHtml(conditionB)}</b><strong>${boolValue(view.checkEnd)}</strong></article><i>=</i><article class="decision ${view.overlap === true ? 'conflict' : view.overlap === false ? 'safe' : ''}"><small>OVERLAP?</small><b>A AND B</b><strong>${boolValue(view.overlap)}</strong></article></div></section>`;

  let relationshipText = vi ? 'Chưa so sánh hai khoảng.' : 'No interval pair is being compared yet.';
  if (view.relationship === 'overlap' && view.intersection) relationshipText = vi
    ? `Có thời gian chung [${view.intersection[0]}, ${view.intersection[1]}). Request phải bị từ chối.`
    : `They share [${view.intersection[0]}, ${view.intersection[1]}). The request must be rejected.`;
  if (view.relationship === 'before' && current && comparedEntry) relationshipText = vi
    ? `${current[1]} ≤ ${comparedEntry.range[0]}: request nằm trước hoặc chỉ chạm biên trái.`
    : `${current[1]} ≤ ${comparedEntry.range[0]}: the request is before or only touches the left boundary.`;
  if (view.relationship === 'after' && current && comparedEntry) relationshipText = vi
    ? `${comparedEntry.range[1]} ≤ ${current[0]}: lịch cũ nằm trước hoặc chỉ chạm biên phải.`
    : `${comparedEntry.range[1]} ≤ ${current[0]}: the old booking is before or only touches the right boundary.`;

  const comparisonRows = current
    ? `${timelineRow(current, vi ? 'REQUEST MỚI' : 'NEW REQUEST', rejected ? 'rejected' : 'request')}${comparedEntry ? timelineRow(comparedEntry.range, `${vi ? 'LỊCH CŨ' : 'OLD BOOKING'} #${comparedEntry.callIndex + 1}`, 'compared') : ''}${view.intersection ? timelineRow(view.intersection, vi ? 'PHẦN GIAO' : 'INTERSECTION', 'intersection', vi ? 'thời gian bị đặt hai lần' : 'double-booked time') : ''}`
    : `<p>${vi ? 'Chọn một request để bắt đầu.' : 'Select a request to begin.'}</p>`;

  const calendarRows = calendar.length
    ? calendar.map((entry, index) => timelineRow(entry.range, `${vi ? 'LỊCH' : 'BOOKING'} #${entry.callIndex + 1}`, index === view.compared ? 'compared' : index === view.justAdded ? 'added' : 'accepted')).join('')
    : `<p>${vi ? 'Calendar đang rỗng.' : 'The calendar is empty.'}</p>`;
  const resultCells = calls.map((call) => `<span class="${call.state}"><small>#${call.index + 1}</small><b>${call.state === 'accepted' ? 'true' : call.state === 'rejected' ? 'false' : '—'}</b></span>`).join('');

  let action = vi ? 'Khởi tạo calendar = []' : 'Initialize calendar = []';
  if (view.phase === 'request') action = vi ? 'Chưa thêm request; bắt đầu quét calendar.' : 'Do not add the request yet; start scanning calendar.';
  if (view.phase === 'select') action = vi ? 'Lấy một lịch đã nhận để kiểm tra.' : 'Pick one accepted booking to inspect.';
  if (view.phase === 'check-start') action = `A: ${conditionA} → ${boolValue(view.checkStart)}`;
  if (view.phase === 'check-end') action = `B: ${conditionB} → ${boolValue(view.checkEnd)}`;
  if (view.phase === 'decision') action = `${boolValue(view.checkStart)} AND ${boolValue(view.checkEnd)} → ${boolValue(view.overlap)}`;
  if (view.phase === 'append') action = `calendar.append((${current[0]}, ${current[1]}))`;
  if (rejected) action = 'return False · calendar unchanged';
  if (accepted) action = 'return True';
  if (final) action = `results = [${results.join(', ')}]`;

  $('treeView').innerHTML = `<section class="mc729-viz" role="img" aria-label="My Calendar I overlap visualization">
    <header><div><small>INTERVAL DESIGN · #729</small><strong>MY CALENDAR I</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="mc729-phases">${phases}</div>
    <section class="mc729-half-open"><div><span class="closed-dot"></span><strong>start</strong><i></i><strong>end</strong><span class="open-dot"></span></div><p><b>[start, end)</b><span>${vi ? 'Lấy start · không lấy end · hai lịch chạm tại end/start vẫn hợp lệ.' : 'Include start · exclude end · bookings touching at end/start are valid.'}</span></p></section>
    <section class="mc729-calls"><header><strong>${vi ? 'CÁC LẦN GỌI BOOK' : 'BOOK CALLS'}</strong><span>${results.filter(Boolean).length} ${vi ? 'đã nhận' : 'accepted'} · ${results.filter(value => !value).length} ${vi ? 'từ chối' : 'rejected'}</span></header><div>${callCards}</div></section>
    ${conditions}
    <section class="mc729-compare"><header><strong>${vi ? 'CÙNG MỘT TRỤC THỜI GIAN' : 'ONE SHARED TIME AXIS'}</strong><span>${minimum} → ${maximum}</span></header><div class="mc729-axis"><span>${minimum}</span><span>${Math.round((minimum + maximum) / 2)}</span><span>${maximum}</span></div>${comparisonRows}<footer class="${view.overlap === true ? 'conflict' : view.overlap === false ? 'safe' : ''}">${escapeHtml(relationshipText)}</footer></section>
    <section class="mc729-calendar"><header><strong>CALENDAR</strong><span>${calendar.length} ${vi ? 'lịch đã lưu' : 'saved booking(s)'}</span></header><div class="mc729-axis"><span>${minimum}</span><span>${Math.round((minimum + maximum) / 2)}</span><span>${maximum}</span></div><div>${calendarRows}</div></section>
    <section class="mc729-action"><small>${vi ? 'DÒNG CODE HIỆN TẠI' : 'CURRENT CODE ACTION'}</small><strong>${escapeHtml(action)}</strong><span>${escapeHtml(pick(view.explanation))}</span></section>
    <footer class="mc729-results ${final ? 'done' : ''}"><header><strong>${vi ? 'KẾT QUẢ THEO THỨ TỰ GỌI' : 'RESULTS IN CALL ORDER'}</strong><span>${final ? `[${results.join(', ')}]` : vi ? 'đang xử lý…' : 'in progress…'}</span></header><div>${resultCells}</div></footer>
  </section>`;
}

function renderCalendar731View(step) {
  const view = step.calendar731View || {};
  const vi = lang === 'vi';
  const current = Array.isArray(view.current) ? view.current : null;
  const calendar = Array.isArray(view.calendar) ? view.calendar : [];
  const doubles = Array.isArray(view.doubles) ? view.doubles : [];
  const calls = Array.isArray(view.callStates) ? view.callStates : [];
  const results = Array.isArray(view.results) ? view.results : [];
  const coverage = Array.isArray(view.coverage) ? view.coverage : [];
  const minimum = Number.isFinite(view.minimum) ? view.minimum : 0;
  const maximum = Number.isFinite(view.maximum) ? view.maximum : minimum + 1;
  const span = Math.max(1, maximum - minimum);
  const phaseIndex = Number.isInteger(view.phaseIndex) ? view.phaseIndex : 0;
  const checkingDouble = view.phase === 'check-double' || view.phase === 'rejected';
  const comparedEntry = checkingDouble
    ? (Number.isInteger(view.doubleCompared) && view.doubleCompared >= 0 ? doubles[view.doubleCompared] : null)
    : (Number.isInteger(view.compared) && view.compared >= 0 ? calendar[view.compared] : null);
  const comparedRange = comparedEntry && comparedEntry.range;
  const final = view.phase === 'done';
  const rejected = view.phase === 'rejected';
  const accepted = view.phase === 'accepted';

  const phases = (vi
    ? ['Nhận request', 'Chặn phủ 3 lần', 'Tạo vùng phủ 2', 'Lưu booking', 'Kết quả']
    : ['Read request', 'Block triple', 'Build doubles', 'Save booking', 'Result'])
    .map((label, index) => `<span class="${index < phaseIndex ? 'done' : index === phaseIndex ? 'active' : ''}"><b>${index < phaseIndex ? '✓' : index + 1}</b>${escapeHtml(label)}</span>`).join('');

  const position = (value) => 100 * (value - minimum) / span;
  const rangeBar = (range, state, text = '') => {
    if (!Array.isArray(range)) return '';
    const left = Math.max(0, Math.min(100, position(range[0])));
    const width = Math.max(1, Math.min(100 - left, 100 * (range[1] - range[0]) / span));
    return `<span class="mc731-bar ${state}" style="left:${left}%;width:${width}%"><i>${escapeHtml(text)}</i></span>`;
  };
  const timelineRow = (range, label, state, detail = '') => `<div class="mc731-timeline-row"><header><strong>${escapeHtml(label)}</strong><span>[${range[0]}, ${range[1]})${detail ? ` · ${escapeHtml(detail)}` : ''}</span></header><div class="mc731-track">${rangeBar(range, state)}</div></div>`;
  const axis = `<div class="mc731-axis"><span>${minimum}</span><span>${Math.round((minimum + maximum) / 2)}</span><span>${maximum}</span></div>`;

  const callCards = calls.map((call) => {
    const stateLabel = call.state === 'accepted' ? 'TRUE' : call.state === 'rejected' ? 'FALSE' : call.state === 'current' ? 'CURRENT' : vi ? 'chờ' : 'pending';
    return `<article class="mc731-call ${call.state}"><small>book #${call.index + 1}</small><strong>[${call.range[0]}, ${call.range[1]})</strong><span>${stateLabel}</span></article>`;
  }).join('');

  const boolValue = (value) => value == null ? '?' : value ? 'TRUE' : 'FALSE';
  const targetName = checkingDouble ? (vi ? 'DANGER ZONE' : 'DANGER ZONE') : (vi ? 'LỊCH ĐÃ NHẬN' : 'ACCEPTED BOOKING');
  const conditionA = current && comparedRange ? `${current[0]} < ${comparedRange[1]}` : 'start < old_end';
  const conditionB = current && comparedRange ? `${comparedRange[0]} < ${current[1]}` : 'old_start < end';
  const conditionPanel = `<section class="mc731-check ${checkingDouble ? 'guard' : 'build'}"><header><div><small>${checkingDouble ? (vi ? 'BƯỚC CHẶN TRIPLE' : 'TRIPLE GUARD') : (vi ? 'BƯỚC TẠO DOUBLE' : 'BUILD DOUBLES')}</small><strong>${current ? `[${current[0]}, ${current[1]})` : 'request'} ${comparedRange ? `vs [${comparedRange[0]}, ${comparedRange[1]})` : `vs ${checkingDouble ? 'doubles' : 'calendar'}`}</strong></div><span>${targetName}</span></header><div class="mc731-conditions"><article class="${view.checkStart === true ? 'pass' : view.checkStart === false ? 'fail' : ''}"><small>A</small><b>${escapeHtml(conditionA)}</b><strong>${boolValue(view.checkStart)}</strong></article><i>AND</i><article class="${view.checkEnd === true ? 'pass' : view.checkEnd === false ? 'fail' : ''}"><small>B</small><b>${escapeHtml(conditionB)}</b><strong>${boolValue(view.checkEnd)}</strong></article><i>=</i><article class="decision ${view.overlap === true ? 'hit' : view.overlap === false ? 'miss' : ''}"><small>OVERLAP?</small><b>A AND B</b><strong>${boolValue(view.overlap)}</strong></article></div>${view.intersection ? `<footer class="${rejected ? 'danger' : 'double'}"><b>[${view.intersection[0]}, ${view.intersection[1]})</b><span>${rejected ? (vi ? 'đã có 2 lịch; request sẽ tạo lịch thứ 3' : 'already has 2 bookings; request would be the 3rd') : (vi ? 'phần giao được thêm vào doubles' : 'intersection added to doubles')}</span></footer>` : ''}</section>`;

  const coverageRow = (key, label) => `<div class="mc731-coverage-row"><strong>${escapeHtml(label)}</strong><div class="mc731-coverage-track">${coverage.map((segment) => {
    const left = Math.max(0, Math.min(100, position(segment.start)));
    const width = Math.max(0.8, Math.min(100 - left, 100 * (segment.end - segment.start) / span));
    const level = Number(segment[key] || 0);
    return `<span class="level-${Math.min(3, level)}${segment.requestCovers && key === 'proposed' ? ' request-zone' : ''}" style="left:${left}%;width:${width}%" title="[${segment.start}, ${segment.end}) = ${level}x"><b>${level}×</b></span>`;
  }).join('')}</div></div>`;
  const maximumProposed = coverage.reduce((best, segment) => Math.max(best, Number(segment.proposed || 0)), 0);
  const coverageStatus = maximumProposed >= 3
    ? (vi ? 'Có vùng 3×: phải từ chối' : 'A 3× region exists: reject')
    : (vi ? 'Không vùng nào vượt 2×' : 'No region exceeds 2×');

  const calendarRows = calendar.length
    ? calendar.map((entry, index) => timelineRow(entry.range, `${vi ? 'BOOKING' : 'BOOKING'} #${entry.callIndex + 1}`, index === view.compared ? 'compared' : index === view.justAddedCalendar ? 'added' : 'accepted')).join('')
    : `<p>${vi ? 'Chưa có booking nào được nhận.' : 'No accepted booking yet.'}</p>`;
  const doubleRows = doubles.length
    ? doubles.map((entry, index) => timelineRow(entry.range, `D${index + 1}`, index === view.doubleCompared ? (rejected ? 'triple' : 'compared') : index === view.justAddedDouble ? 'new-double' : 'double', `${vi ? 'từ book' : 'from books'} #${entry.sourceCalls.map(value => value + 1).join(' + #')}`)).join('')
    : `<p>${vi ? 'Chưa có vùng nào bị phủ hai lần.' : 'No region is covered twice yet.'}</p>`;
  const resultCells = calls.map((call) => `<span class="${call.state}"><small>#${call.index + 1}</small><b>${call.state === 'accepted' ? 'true' : call.state === 'rejected' ? 'false' : '—'}</b></span>`).join('');

  let action = vi ? 'calendar = [] · doubles = []' : 'calendar = [] · doubles = []';
  if (view.phase === 'request') action = vi ? 'Chưa sửa dữ liệu; kiểm tra doubles trước.' : 'Do not mutate data; inspect doubles first.';
  if (view.phase === 'check-double') action = `for danger in doubles: ${conditionA} AND ${conditionB}`;
  if (view.phase === 'doubles-safe') action = vi ? 'Không tạo triple; bắt đầu so với từng booking cũ.' : 'No triple is possible; compare every accepted booking.';
  if (view.phase === 'check-calendar') action = `for old in calendar: ${conditionA} AND ${conditionB}`;
  if (view.phase === 'add-double' && view.intersection) action = `doubles.append((${view.intersection[0]}, ${view.intersection[1]}))`;
  if (view.phase === 'append' && current) action = `calendar.append((${current[0]}, ${current[1]}))`;
  if (rejected) action = vi ? 'return False · calendar và doubles giữ nguyên' : 'return False · calendar and doubles stay unchanged';
  if (accepted) action = 'return True';
  if (final) action = `results = [${results.join(', ')}]`;

  $('treeView').innerHTML = `<section class="mc731-viz" role="img" aria-label="My Calendar II double and triple booking visualization">
    <header><div><small>INTERVAL DESIGN · #731</small><strong>MY CALENDAR II</strong></div><span>${escapeHtml(pick(step.title))}</span></header>
    <div class="mc731-phases">${phases}</div>
    <section class="mc731-model"><article><small>calendar</small><strong>${vi ? 'Mọi booking đã nhận' : 'Every accepted booking'}</strong><span>${calendar.length} ${vi ? 'khoảng' : 'interval(s)'}</span></article><i>${vi ? 'overlap tạo' : 'overlap creates'}</i><article class="double"><small>doubles</small><strong>${vi ? 'Các vùng đã phủ 2 lần' : 'Regions already covered 2×'}</strong><span>${doubles.length} danger zone(s)</span></article><i>${vi ? 'request chạm' : 'request touches'}</i><article class="triple"><small>TRIPLE</small><strong>${vi ? 'Phủ 3 lần: cấm' : 'Covered 3×: forbidden'}</strong><span>return False</span></article></section>
    <section class="mc731-calls"><header><strong>${vi ? 'CÁC LẦN GỌI BOOK' : 'BOOK CALLS'}</strong><span>${results.filter(Boolean).length} ${vi ? 'đã nhận' : 'accepted'} · ${results.filter(value => !value).length} ${vi ? 'từ chối' : 'rejected'}</span></header><div>${callCards}</div></section>
    ${conditionPanel}
    <section class="mc731-coverage ${maximumProposed >= 3 ? 'danger' : 'safe'}"><header><div><strong>${vi ? 'SỐ LỊCH PHỦ TRÊN CÙNG TRỤC THỜI GIAN' : 'COVERAGE ON ONE SHARED TIME AXIS'}</strong><span>${vi ? 'Đỏ 3× là triple booking' : 'Red 3× means triple booking'}</span></div><b>${escapeHtml(coverageStatus)}</b></header>${axis}${coverageRow('base', vi ? 'HIỆN TẠI' : 'CURRENT')}${coverageRow('proposed', vi ? '+ REQUEST' : '+ REQUEST')}</section>
    <section class="mc731-lists"><article><header><strong>calendar</strong><span>${calendar.length} ${vi ? 'booking đã nhận' : 'accepted'}</span></header>${axis}<div>${calendarRows}</div></article><article class="doubles"><header><strong>doubles</strong><span>${vi ? 'danger zones: request không được chạm' : 'danger zones: requests must not touch'}</span></header>${axis}<div>${doubleRows}</div></article></section>
    <section class="mc731-action"><small>${vi ? 'DÒNG CODE HIỆN TẠI' : 'CURRENT CODE ACTION'}</small><strong>${escapeHtml(action)}</strong><span>${escapeHtml(pick(view.explanation))}</span></section>
    <footer class="mc731-results ${final ? 'done' : ''}"><header><strong>${vi ? 'KẾT QUẢ THEO THỨ TỰ GỌI' : 'RESULTS IN CALL ORDER'}</strong><span>${final ? `[${results.join(', ')}]` : vi ? 'đang xử lý…' : 'in progress…'}</span></header><div>${resultCells}</div></footer>
  </section>`;
}

function renderRangeModuleView(step) {
  const v = step.rangeModuleView, vi = lang === 'vi';
  const labels = vi
    ? { init: 'Khởi tạo', request: 'Đọc lệnh', search: 'Tìm kiếm nhị phân', bound: 'Tìm được vị trí chèn', boundary: 'Chọn mốc biên', applied: 'Đã cập nhật', result: 'Kết quả truy vấn', done: 'Hoàn tất' }
    : { init: 'Initialize', request: 'Read operation', search: 'Binary search', bound: 'Insertion index found', boundary: 'Choose endpoints', applied: 'Updated', result: 'Query result', done: 'Complete' };
  const method = v.current && v.current[0];
  const query = method === 'queryRange';
  const outcome = v.phase === 'result' ? v.results[v.callIndex] : null;
  const rangeText = points => points.length
    ? points.filter((_, index) => index % 2 === 0).map((left, index) => `[${left}, ${points[index * 2 + 1]})`).join(' ∪ ')
    : (vi ? 'Rỗng ∅' : 'Empty ∅');
  const tracked = (points, left) => {
    for (let index = 0; index < points.length; index += 2) {
      if (points[index] <= left && left < points[index + 1]) return true;
    }
    return false;
  };
  const trackRow = (points, label, requestOnly = false) => {
    const cells = v.coordinates.slice(0, -1).map((left, index) => {
      const right = v.coordinates[index + 1];
      const requested = v.current && v.current[1] <= left && right <= v.current[2];
      const covered = tracked(points, left);
      const gap = !requestOnly && outcome === false && requested && !covered;
      const state = requestOnly
        ? (requested ? (query ? 'query' : method === 'addRange' ? 'add' : 'remove') : '')
        : covered ? 'covered' : gap ? 'gap' : '';
      const detail = requestOnly
        ? (requested ? (vi ? 'trong lệnh hiện tại' : 'in current operation') : (vi ? 'ngoài lệnh' : 'outside operation'))
        : covered ? (vi ? 'đang theo dõi' : 'tracked') : (vi ? 'chưa theo dõi' : 'untracked');
      return `<span class="rm715-cell ${state}" title="[${left}, ${right}): ${detail}">${requestOnly ? (requested ? '•' : '') : covered ? '✓' : gap ? '×' : '·'}</span>`;
    }).join('');
    return `<div class="rm715-row"><strong>${escapeHtml(label)}</strong><div class="rm715-track">${cells}</div></div>`;
  };
  const axis = v.coordinates.map((value, index) => `<span style="left:${100 * index / (v.coordinates.length - 1)}%">${value}</span>`).join('');
  const searchPoints = v.phase === 'applied' ? v.before : v.points;
  const endpointCards = [...searchPoints, null].map((value, index) => {
    const markers = [];
    if (index === v.i) markers.push('i');
    if (index === v.j) markers.push('j');
    if (v.binary) {
      for (const key of ['lo', 'mid', 'hi']) if (v.binary[key] === index) markers.push(key);
    }
    const sliced = v.replacement !== null && index >= v.i && index < v.j;
    const current = v.binary && index === v.binary.mid;
    return `<div class="rm715-point${current ? ' mid' : ''}${sliced ? ' sliced' : ''}${value === null ? ' sentinel' : ''}"><small>${index}</small><b>${value === null ? '∅' : value}</b><span>${value === null ? 'len' : index % 2 === 0 ? (vi ? 'mở [' : 'start [') : (vi ? 'đóng )' : 'end )')}</span><em>${markers.join(' · ') || ' '}</em></div>`;
  }).join('');
  const bounds = v.current ? `<div class="rm715-bounds"><div><small>i = bisect_${query ? 'right' : 'left'}(points, ${v.current[1]})</small><strong>${v.i ?? '?'}</strong><span>${vi ? 'Đếm mốc' : 'Count endpoints'} ${query ? '≤' : '&lt;'} left</span></div><div><small>j = bisect_${query ? 'left' : 'right'}(points, ${v.current[2]})</small><strong>${v.j ?? '?'}</strong><span>${vi ? 'Đếm mốc' : 'Count endpoints'} ${query ? '&lt;' : '≤'} right</span></div></div>` : '';
  let action = 'points = []';
  if (v.binary) action = `${v.binary.variable} = bisect_${v.binary.side}(points, ${v.binary.target}) · lo = ${v.binary.lo}, hi = ${v.binary.hi}${v.binary.mid == null ? '' : `, mid = ${v.binary.mid}`}`;
  else if (query) action = `i == j and i % 2 == 1${outcome == null ? '' : ` → ${outcome}`}`;
  else if (v.replacement !== null) action = `points[${v.i}:${v.j}] = ${JSON.stringify(v.replacement)}`;
  else if (v.current) action = `${method}(${v.current[1]}, ${v.current[2]})`;
  else if (v.phase === 'done') action = `points = ${JSON.stringify(v.points)}`;
  const calls = v.operations.map(([name, left, right], index) => {
    const completed = index < v.results.length;
    const state = index === v.callIndex ? 'current' : completed ? 'complete' : '';
    const result = completed ? String(v.results[index]) : (vi ? 'chờ' : 'pending');
    return `<li class="${state}"><small>#${index + 1}</small><code>${name}(${left}, ${right})</code><b class="${completed && typeof v.results[index] === 'boolean' ? v.results[index] ? 'yes' : 'no' : ''}">${result}</b></li>`;
  }).join('');
  $('treeView').innerHTML = `<section class="rm715-viz" aria-label="${vi ? 'Trực quan hóa Range Module' : 'Range Module visualization'}">
    <header><div><small>BINARY SEARCH · #715</small><h3>Range Module</h3></div><span>${escapeHtml(labels[v.phase])}</span></header>
    <p class="rm715-invariant">${vi ? 'Mốc chẵn mở vùng, mốc lẻ đóng vùng. Khoảng [left, right) chứa mọi số thực từ left đến trước right.' : 'Even-indexed endpoints start coverage; odd-indexed endpoints end it. [left, right) contains every real number from left up to, but excluding, right.'}</p>
    <section class="rm715-coverage"><h4>${vi ? 'Vùng được theo dõi' : 'Tracked ranges'}</h4>
      <p>${vi ? 'Trục nén: các mốc cách đều để thấy rõ khoảng hẹp. Độ dài hiển thị không theo tỷ lệ.' : 'Compressed axis: endpoints are equally spaced to reveal narrow gaps. Displayed lengths are not proportional.'}</p>
      <div class="rm715-scroll" tabindex="0" role="region" aria-label="${vi ? 'Trục vùng theo dõi, có thể cuộn ngang' : 'Coverage axis, horizontally scrollable'}"><div class="rm715-scale" style="width:${Math.max(340, (v.coordinates.length - 1) * 68)}px">
        <div class="rm715-axis">${axis}</div>
        ${v.current ? trackRow(v.before, vi ? 'Trước lệnh' : 'Before operation') + trackRow([], `${method} [${v.current[1]}, ${v.current[2]})`, true) : ''}
        ${trackRow(v.points, vi ? 'Hiện tại · points' : 'Current · points')}
      </div></div>
      <p class="rm715-legend"><span class="covered">✓ ${vi ? 'Đang theo dõi' : 'Tracked'}</span><span>· ${vi ? 'Chưa theo dõi' : 'Untracked'}</span><span class="gap">× ${vi ? 'Phần truy vấn còn thiếu' : 'Uncovered part of query'}</span></p>
      <code class="rm715-ranges">${escapeHtml(rangeText(v.points))}</code>
    </section>
    <section class="rm715-endpoints"><h4>${v.phase === 'applied' ? (vi ? 'points trước khi thay lát cắt' : 'points before slice replacement') : 'points'}</h4><p>${vi ? 'Index ở trên; giá trị mốc ở giữa; i và j là vị trí chèn. ∅ là vị trí ngay sau phần tử cuối, không phải mốc thật.' : 'Index above, endpoint value in the middle; i and j are insertion positions. ∅ is the slot after the last element, not an actual endpoint.'}</p><div class="rm715-point-list">${endpointCards}</div>${bounds}</section>
    <section class="rm715-action${outcome === true ? ' yes' : outcome === false ? ' no' : ''}" aria-live="polite"><code>${escapeHtml(action)}</code><p>${escapeHtml(pick(v.explanation))}</p>${v.phase === 'applied' ? `<strong>points → ${escapeHtml(JSON.stringify(v.points))}</strong>` : ''}</section>
    <section class="rm715-calls"><h4>${vi ? 'Lệnh và kết quả' : 'Operations and results'}</h4><ol>${calls || `<li>${vi ? 'Chưa có lệnh.' : 'No operations.'}</li>`}</ol><p>${vi ? 'add/remove trả null; tự khởi tạo RangeModule(), không thêm null cho constructor.' : 'Add/remove return null; RangeModule() is automatic, so no constructor null is included.'}</p></section>
    <footer><strong>${vi ? 'Kết quả' : 'Results'}</strong><code>${escapeHtml(JSON.stringify(v.results))}</code></footer>
  </section>`;
}

function renderCalendarView(step) {
  const v = step.calendarView, vi = lang === 'vi';
  const isTwo = v.problemId === 731;
  const row = (pair, label, state) => {
    const left = 100 * (pair[0] - v.minimum) / (v.maximum - v.minimum);
    const width = 100 * (pair[1] - pair[0]) / (v.maximum - v.minimum);
    return `<div class="cal729-row"><span>${escapeHtml(label)} <b>[${pair[0]}, ${pair[1]})</b></span><div class="cal729-track"><div class="cal729-bar ${state}" style="left:${left}%;width:${width}%"></div></div></div>`;
  };
  const labels = vi ? {init:'Khởi tạo',request:'Lịch mới',compare:'So sánh',accepted:'Đã nhận · true',rejected:'Từ chối · false',done:'Hoàn tất'} : {init:'Initialize',request:'New request',compare:'Compare',accepted:'Accepted · true',rejected:'Rejected · false',done:'Complete'};
  labels['check-double'] = vi ? 'Kiểm tra vùng đặt hai lần' : 'Check double-booked regions';
  labels['add-double'] = vi ? 'Thêm vùng đặt hai lần' : 'Add double-booked region';
  $('treeView').innerHTML = `<section class="cal729-view"><h3>My Calendar ${isTwo ? 'II' : 'I'} · ${labels[v.phase]}</h3>
    ${isTwo ? `<p>${vi ? 'Cho phép hai lịch cùng lúc. Lịch mới giao với doubles sẽ tạo ba lịch và bị từ chối.' : 'Double bookings are allowed. A request overlapping doubles would create a triple booking and is rejected.'}</p>` : ''}
    <p>${vi ? 'Khoảng [start,end): lấy start, không lấy end. Chạm biên được phép.' : 'Intervals [start,end): include start, exclude end. Touching endpoints are allowed.'}</p>
    <div class="cal729-formula"><code>start &lt; e &amp;&amp; s &lt; end</code></div>
    <p>${vi ? 'Xanh: đã nhận · Vàng: đang so sánh · Tím: lịch mới · Đỏ: từ chối' : 'Green: accepted · Amber: comparing · Purple: request · Red: rejected'}${isTwo ? (vi ? ' · Vùng doubles cũng dùng màu tím' : ' · Doubles regions also use purple') : ''}</p>
    <div class="cal729-axis"><span>${v.minimum}</span><span>${v.maximum}</span></div>
    ${v.current ? row(v.current, vi ? 'Lịch mới' : 'Request', v.phase === 'rejected' ? 'rejected' : 'request') : ''}
    <h4>${vi ? 'Lịch đã nhận' : 'Accepted bookings'}</h4>
    <div class="cal729-bookings">${v.calendar.map((p,i) => row(p, '#' + (i+1), i === v.compared ? 'compared' : 'accepted')).join('') || `<p>${vi ? 'Lịch rỗng' : 'Empty calendar'}</p>`}</div>
    ${isTwo ? `<h4>${vi ? 'Vùng đặt hai lần · doubles' : 'Double-booked regions · doubles'}</h4><div class="cal729-bookings">${v.doubles.map((p,i) => row(p, 'D' + (i+1), i === v.doubleCompared ? (v.phase === 'rejected' ? 'rejected' : 'compared') : 'request')).join('') || `<p>${vi ? 'Chưa có vùng đặt hai lần' : 'No double-booked regions yet'}</p>`}</div>${v.intersection ? `<p><code>[max(start,s), min(end,e)) = [${v.intersection[0]}, ${v.intersection[1]})</code></p>` : ''}` : ''}
    <p><strong>${vi ? 'Kết quả' : 'Results'}:</strong> <code>${escapeHtml(JSON.stringify(v.results))}</code></p></section>`;
}
