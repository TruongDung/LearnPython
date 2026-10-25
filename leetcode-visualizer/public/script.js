const PRIMARY_VISUALIZATION_SURFACES = ["bars", "treeView", "gridView", "bfsGridView", "liveVarsView"];

// Phase 3 keeps the large shared renderer/style chunks out of the initial page.
// The manifest is grouped by asset to stay compact and is inverted once below.
const SHARED_RENDERER_BUNDLES = Object.freeze({"app-renderers-base.js":["renderBfsGrid","renderRottingOrangesView"],"renderers-01.js":["renderNextPermutation31View","renderPermutation46View","renderLexPermutation3720View","renderPalindromicPermutation3734View","renderStoneGameIIView","renderStoneGameIVView","renderStoneGameView","renderPredictWinnerView","renderRectangleAreaView","renderBuildingBoxesView","renderNetworkDelayView","renderReachable882View","renderMaze499View","renderRestricted1786View","renderMultiDijkstra2203View","renderPathExistsDfsView","renderPathExistsBfsView","renderBipartiteView","renderTreeDpLessonView","renderCycle2360View","renderCountPaths1976View","renderGraph","renderBinaryWatch401View","renderSubsets90BitmaskView","renderSubsets78BitmaskView","renderOddEven975View","renderVisibleQueue1944View","renderMaxMin1950View","renderDistinctSubseq940View","renderBstPreorder255View","renderValidSubarrays1063View","renderTotalStrength2281View","renderVisibleMountains2345View","renderMaximumSumQueries2736View","renderBuildingMeet2940View","renderProductExcept238View","renderUniqueEven3483View","renderPourWater755View","renderChampagne799View","renderMaximizeScore2818View","renderMinIncrements1526View","renderCountCommas3870View","renderCountCommas3871View","renderStable3903View","renderCriticalPoints2058View","renderJewelsStonesView","renderPalindromePartitionView","renderNonDecreasingSubsequencesView"],"renderers-02.js":["renderReplaceWordsView","renderTranspose867View","renderLinkedList","renderOnlineElectionView","renderShipCapacityView","renderKokoSpeedView","renderSqrtBinaryView","renderNonOverlapView","renderLeaves366View","renderLogger359View","renderRleIter900View","renderMatchSubseq792View","renderAttendance552View","renderBattleships419View","renderScreenFit418View","renderDifferByOne1554View","renderShortestWay1055View","renderSwimWater778View","renderGridElim1293View","renderGcThreshold1627View","renderClockDiffView","renderLrSwapView","renderRandomPickView","renderSearchRangeView","renderBlockQueriesView","renderHistogramRectangleView","renderMaxNonDecreasingView","renderBoundaryMaxView","renderSortedSubmatrixView","renderStackView","renderCircularDequeView","renderQueueView","renderCalculator772View","renderCalculator772BView","renderCamera968View","renderTiling1240View","renderStudents1349View","renderSuperstring943View","renderGoodStrings1397View","renderDistribute1655View","renderDistribute1655BacktrackView","renderSentenceView","renderSynonymSentenceView","renderPrefix2DView","renderPrefixSumCountView","renderPrefixRemainderView","renderDifferenceArrayView"],"renderers-03.js":["renderKthPalindromeView","renderPalindromeBuildView","renderOccurrenceLookupView","renderDuplicateZerosView","renderGcdPairsView","renderRotateArray189View","renderRotatedSearch81View","renderRotatedSearchView","renderFindMinRotatedView","renderRunningSumView","renderCalendarThreeView","renderFallingSquaresView","renderReversePairsSegmentTreeView","renderReversePairsView","renderBookMyShowView","renderRangeFrequencyView","renderEvenOddFillView","renderDigitPodiumView","renderPartitionView","renderTwoPointerMergeView","renderTriangleCountView","renderSubstringConcatView","renderSequenceTraceView","renderTaskSchedulerView","renderHappyNumberView","renderSmallHashView","renderBalanced1234View","renderNice1248View","renderExactK992View","renderComplement1658View","renderNumberBfs2059View","renderShelfDp1105View","renderServerHeap1606View","renderMeetingRooms2402View","renderAdjacentRuns3350View","renderDigitSum3550View","renderPermutation1589View","renderPrefixScores2416View","renderBraceExpansion1096View","renderWeakCharacters1996View","renderLongestLine562View","renderNodeSequence2242View","renderSlidingFreqView","renderCandyAllocationView","renderRepeatingRunsView","renderBinaryReductionView","renderFourSumPairsView"],"renderers-04.js":["renderPrefixAverageView","renderReplaceGreatestView","renderSortParity905View","renderMountainArrayView","renderHouses2320View","renderStoneGame1690View","renderPizza1388View","renderBrainpower2140View","renderDeleteEarn740View","renderMaximumProductView","renderProductSubarrayView","renderMinimumSubarrayView","renderTwoSubarrays1477View","renderAverageWindowView","renderRectangleSweepView","renderKruskalEffortView","renderWaterDistributionView","renderConnectCitiesView","renderParallelCoursesView","renderLoudRichView","renderLruCacheView","renderLfuCacheView","renderMusicPlayerView","renderRideSharingView","renderTwitterView","renderCyclicSortView","renderMergeIntervalsView","renderMeetingRoomsTimelineView","renderPairChainView","renderMeetingTimelineView","renderSkylineView","renderGasStationView","renderGasDepositsView","renderGasCircularView","renderTrapRain2View","renderDescendantSum1973View","renderAverageSubtree2265View","renderDistributeCoins979View","renderLargestBst333View","renderMaximumSumBst1373View","renderMaximumAverage1120View","renderMissingIntegerView","renderSortedArrayCostView","renderRangeSumFenwickView","renderRangeSumSegmentTreeView","renderRangeSumCountView","renderCountSmallerView","renderEvenOddRatioView","renderTrappingRainView","renderSumQueriesView","renderSegmentTreeView","renderFenwickView"],"renderers-05.js":["renderXMatrix2319View","renderParentheses1111View","renderTicketsView","renderStockCooldownView","renderMaximalSquareView","renderNumberOfLISView","renderLIS2407View","renderWordLadder126View","renderHouseRobberView","renderMinCostStairsView","renderTwoEvents2054View","renderWeightedIntervals3414View","renderAdvancedBitmaskView","renderBitmaskBasicsView","renderCountBitsView","renderWordBreakView","renderCinemaSeatView","renderCoinChangeView","renderMissingNumberView","renderAlmostMissingView","renderPascalTriangleView","renderFibonacciView","renderTribonacciView","renderClimbingStairsView","renderMapSumView","renderLongestDuplicateView","renderClearStarsView","renderValidSequenceView","renderWordSearchIIView","renderAutocompleteView","renderFileSystemView","renderWordDictionaryView","renderSeparate1977View","renderMissing3718View","renderRussian354View","renderParen32View","renderWordBreakIIView","renderMountain1095View","renderDirected685View","renderEmployee690View","renderVideos1311View","renderBombs2101View","renderThrone1600View","renderNary429View","renderRotation1886View","renderConvert2022View","renderImageOverlap835View","renderSearchMatrix240View","renderSearchMatrix74View","renderSetMatrixZeroes73View","renderRotate48View","renderSpiral54View","renderElevator4027View","renderRandomizedSet380View","renderRandomizedCollection381View","renderLexSwap2948View","renderAllocator2502View","renderDataStream352View","renderMaxPoints149View","renderRemoveBoxes546View","renderStoneGame1872View","renderAbsoluteSubarray1749View","renderCircularMaximumSubarrayView"],"renderers-06.js":["renderReverseParen1190View","renderBricks803View","renderMalware928View","renderMalware924View","renderCountPairs2316View","renderEqualityEquationsView","renderMultiplesIeView","renderStones947View","renderEquivalent1061View","renderIslands305View","renderDirections2096View","renderReverseDegree3498View","renderFindXValue3524View","renderMinWindow76View","renderFindXValue3525View","renderClosestBst270View","renderBoundary545View","renderConsecutive549View","renderClosestLeaf742View","renderInorderSuccessor510View","renderInorderSuccessor285View","renderClosestBst272View","renderDiceRoll1223View","renderCyclicShift4052View","renderShadowPairs4054View","renderShadowPairs4055View","renderEquallySpaced4048View","renderEquallySpaced4049View","renderMinDays4050View","renderDistantSubarrays4051View","renderRectangleArea223View","renderRectangleOverlap836View","renderCircleRectangle1401View","renderOrderlyQueue899View","renderShortestPalindrome214View","renderPalindrome2472View","renderLineSegments1621View","renderDivideString2138View","renderMaximumSubarrayView"]});
const SHARED_RENDERER_STYLES = Object.freeze({"style-01.css":["renderBoundaryMaxView","renderCalculator772BView","renderCalculator772View","renderCamera968View","renderCandyAllocationView","renderCircularDequeView","renderCyclicSortView","renderDifferenceArrayView","renderDigitPodiumView","renderDistribute1655BacktrackView","renderEvenOddFillView","renderFourSumPairsView","renderHistogramRectangleView","renderKokoSpeedView","renderMaxNonDecreasingView","renderOnlineElectionView","renderPartitionView","renderPrefix2DView","renderPrefixRemainderView","renderPrefixSumCountView","renderQueueView","renderRangeSumCountView","renderReplaceWordsView","renderReversePairsView","renderRunningSumView","renderSentenceView","renderShipCapacityView","renderSlidingFreqView","renderSortedSubmatrixView","renderSqrtBinaryView","renderStackView","renderStudents1349View","renderSynonymSentenceView","renderTiling1240View","renderTriangleCountView","renderTwoPointerMergeView"],"style-02.css":["renderBinaryReductionView","renderBinaryWatch401View","renderBookMyShowView","renderCountSmallerView","renderCriticalPoints2058View","renderEvenOddRatioView","renderFenwickView","renderLIS2407View","renderLinkedList","renderLruCacheView","renderMissingIntegerView","renderNonDecreasingSubsequencesView","renderRangeFrequencyView","renderRangeSumFenwickView","renderRepeatingRunsView","renderRideSharingView","renderSegmentTreeView","renderSortedArrayCostView","renderSubsets78BitmaskView","renderSubsets90BitmaskView","renderTrappingRainView","renderWordLadder126View"],"style-03.css":["renderBinaryReductionView","renderBookMyShowView","renderCalculator772BView","renderCalculator772View","renderCandyAllocationView","renderDifferenceArrayView","renderDigitPodiumView","renderFourSumPairsView","renderGasCircularView","renderGasDepositsView","renderGasStationView","renderGraph","renderLruCacheView","renderMeetingRoomsTimelineView","renderMeetingTimelineView","renderMissingIntegerView","renderNonDecreasingSubsequencesView","renderPairChainView","renderPredictWinnerView","renderPrefix2DView","renderPrefixRemainderView","renderPrefixSumCountView","renderRangeFrequencyView","renderRepeatingRunsView","renderRideSharingView","renderRunningSumView","renderSentenceView","renderSkylineView","renderSlidingFreqView","renderStackView","renderTrappingRainView","renderTwitterView","renderTwoPointerMergeView"],"style-04.css":["renderBfsGrid","renderCountPaths1976View","renderLruCacheView","renderMaze499View","renderMultiDijkstra2203View","renderNetworkDelayView","renderNonDecreasingSubsequencesView","renderParallelCoursesView","renderPathExistsBfsView","renderPathExistsDfsView","renderReachable882View","renderRectangleAreaView","renderRestricted1786View","renderRideSharingView","renderStoneGameIIView","renderStoneGameIVView","renderStoneGameView","renderWordLadder126View","renderRottingOrangesView"],"style-05.css":["renderAutocompleteView","renderDuplicateZerosView","renderFileSystemView","renderFindMinRotatedView","renderGcdPairsView","renderKruskalEffortView","renderKthPalindromeView","renderLoudRichView","renderMinimumSubarrayView","renderMountainArrayView","renderPalindromeBuildView","renderParallelCoursesView","renderProductSubarrayView","renderReplaceGreatestView","renderRotatedSearchView","renderSortParity905View","renderWordDictionaryView","renderWordSearchIIView"],"style-06.css":["renderAbsoluteSubarray1749View","renderAllocator2502View","renderAlmostMissingView","renderBrainpower2140View","renderBricks803View","renderCinemaSeatView","renderCircularMaximumSubarrayView","renderClearStarsView","renderClimbingStairsView","renderCoinChangeView","renderConnectCitiesView","renderConvert2022View","renderCountBitsView","renderDeleteEarn740View","renderElevator4027View","renderEqualityEquationsView","renderEquivalent1061View","renderFibonacciView","renderHouseRobberView","renderHouses2320View","renderIslands305View","renderJewelsStonesView","renderLexSwap2948View","renderMapSumView","renderMaximalSquareView","renderMaximumProductView","renderMaximumSubarrayView","renderMinCostStairsView","renderMissing3718View","renderMissingNumberView","renderMultiplesIeView","renderNary429View","renderNonDecreasingSubsequencesView","renderNumberOfLISView","renderOccurrenceLookupView","renderPalindromePartitionView","renderParentheses1111View","renderPascalTriangleView","renderPizza1388View","renderRandomizedCollection381View","renderRandomizedSet380View","renderRotate48View","renderRotation1886View","renderRussian354View","renderSearchMatrix240View","renderSearchMatrix74View","renderSeparate1977View","renderSetMatrixZeroes73View","renderSpiral54View","renderStockCooldownView","renderStoneGame1690View","renderStoneGame1872View","renderStones947View","renderSubstringConcatView","renderTicketsView","renderTribonacciView","renderWaterDistributionView","renderWordBreakView","renderXMatrix2319View"],"style-07.css":["renderAdvancedBitmaskView","renderBalanced1234View","renderBitmaskBasicsView","renderBlockQueriesView","renderBombs2101View","renderBuildingBoxesView","renderBuildingMeet2940View","renderChampagne799View","renderCountPairs2316View","renderDataStream352View","renderDirected685View","renderDistribute1655View","renderEmployee690View","renderExactK992View","renderGoodStrings1397View","renderHappyNumberView","renderLexPermutation3720View","renderMalware924View","renderMalware928View","renderMaxPoints149View","renderMaximizeScore2818View","renderMaximumSumQueries2736View","renderMinIncrements1526View","renderMountain1095View","renderNice1248View","renderOddEven975View","renderPalindromicPermutation3734View","renderParen32View","renderPermutation46View","renderPourWater755View","renderProductExcept238View","renderRemoveBoxes546View","renderSequenceTraceView","renderSmallHashView","renderStable3903View","renderSuperstring943View","renderTaskSchedulerView","renderThrone1600View","renderTotalStrength2281View","renderTranspose867View","renderTreeDpLessonView","renderUniqueEven3483View","renderValidSubarrays1063View","renderVideos1311View","renderVisibleMountains2345View","renderVisibleQueue1944View","renderWordBreakIIView"],"style-08.css":["renderAverageSubtree2265View","renderBstPreorder255View","renderCountCommas3870View","renderCountCommas3871View","renderCycle2360View","renderCyclicShift4052View","renderDescendantSum1973View","renderDiceRoll1223View","renderDistinctSubseq940View","renderEquallySpaced4048View","renderEquallySpaced4049View","renderImageOverlap835View","renderMaxMin1950View","renderMaximumAverage1120View","renderMinIncrements1526View","renderOrderlyQueue899View","renderRangeSumCountView","renderRectangleArea223View","renderRectangleOverlap836View","renderReversePairsView","renderShadowPairs4054View","renderShadowPairs4055View","renderShortestPalindrome214View","renderStable3903View","renderTrapRain2View","renderTwoEvents2054View","renderWeightedIntervals3414View"],"style-09.css":["renderAdjacentRuns3350View","renderAttendance552View","renderBattleships419View","renderBipartiteView","renderBoundary545View","renderBraceExpansion1096View","renderCircleRectangle1401View","renderClockDiffView","renderClosestBst270View","renderClosestBst272View","renderClosestLeaf742View","renderComplement1658View","renderConsecutive549View","renderCountPaths1976View","renderDifferByOne1554View","renderDigitSum3550View","renderDirections2096View","renderDistantSubarrays4051View","renderDistributeCoins979View","renderDivideString2138View","renderFindXValue3524View","renderFindXValue3525View","renderGcThreshold1627View","renderGridElim1293View","renderInorderSuccessor285View","renderInorderSuccessor510View","renderLIS2407View","renderLargestBst333View","renderLeaves366View","renderLineSegments1621View","renderLogger359View","renderLongestLine562View","renderLrSwapView","renderLruCacheView","renderMatchSubseq792View","renderMaximumSumBst1373View","renderMeetingRooms2402View","renderMinDays4050View","renderMinWindow76View","renderMusicPlayerView","renderNetworkDelayView","renderNodeSequence2242View","renderNonDecreasingSubsequencesView","renderNonOverlapView","renderNumberBfs2059View","renderPermutation1589View","renderPrefixScores2416View","renderRandomPickView","renderReverseDegree3498View","renderReverseParen1190View","renderRideSharingView","renderRleIter900View","renderRotatedSearch81View","renderScreenFit418View","renderSearchRangeView","renderSequenceTraceView","renderServerHeap1606View","renderShelfDp1105View","renderShortestWay1055View","renderSumQueriesView","renderSwimWater778View","renderTwoSubarrays1477View","renderWeakCharacters1996View","renderWordLadder126View"]});
const PHASE_FOUR_RENDERER_BUNDLES = Object.freeze({
  "renderer-requested-visualizations.js": ["renderMatrix542View", "renderLandDistance1162View", "renderHighestPeak1765View", "renderWallsAndGates286View", "renderShortestBridge934View", "renderPacificAtlantic417View", "renderLargestColor1857View", "renderSafeStates802View", "renderCourse1462View", "renderParallelCourses2050View", "renderUnionFind684View", "renderFlights787View", "renderVisitAll847View", "renderCoins2218View", "renderBfs9006View", "renderProfitTracker9001View", "renderSquare9013View", "renderLoyal9014View", "renderSweep9015View", "renderFriends9016View", "renderAds9017View"],
  "renderer-hard-problems.js": ["renderHardProblemView"],
});
const PHASE_FOUR_RENDERER_STYLES = Object.freeze({
  "requested-visualizations.css": PHASE_FOUR_RENDERER_BUNDLES["renderer-requested-visualizations.js"],
  "hard-problems.css": PHASE_FOUR_RENDERER_BUNDLES["renderer-hard-problems.js"],
});

const SHARED_VISUALIZATION_ASSETS_BY_RENDERER = (() => {
  const assets = new Map();
  [SHARED_RENDERER_BUNDLES, PHASE_FOUR_RENDERER_BUNDLES].forEach((manifest) => {
    Object.entries(manifest).forEach(([script, rendererNames]) => {
      rendererNames.forEach((rendererName) => assets.set(rendererName, { script, styles: [] }));
    });
  });
  [SHARED_RENDERER_STYLES, PHASE_FOUR_RENDERER_STYLES].forEach((manifest) => {
    Object.entries(manifest).forEach(([style, rendererNames]) => {
      rendererNames.forEach((rendererName) => assets.get(rendererName)?.styles.push(style));
    });
  });
  return assets;
})();

function sharedVisualizationAssetNodes(fileNames) {
  const requested = new Set(fileNames);
  return [...document.querySelectorAll("template[data-shared-visualization-assets]")]
    .flatMap((template) => [...template.content.querySelectorAll("link[href], script[src]")])
    .filter((asset) => {
      const source = asset.getAttribute("href") || asset.getAttribute("src") || "";
      const fileName = new URL(source, document.baseURI).pathname.split("/").pop();
      return requested.has(fileName);
    });
}
function rendererFunctionName(rendererEntry) {
  return rendererEntry?.render?.toString().match(/\b(render[A-Za-z0-9_]+)\s*\(\s*step\b/)?.[1] || null;
}

async function ensureSharedVisualizationAssets(nextSteps) {
  const rendererNames = new Set();
  for (const step of nextSteps || []) {
    const rendererEntry = ORDERED_RENDERER_REGISTRY.find(({ predicate }) => predicate(step));
    const rendererName = rendererFunctionName(rendererEntry);
    if (rendererName) rendererNames.add(rendererName);
  }

  const scripts = new Set();
  const styles = new Set();
  rendererNames.forEach((rendererName) => {
    const assets = SHARED_VISUALIZATION_ASSETS_BY_RENDERER.get(rendererName);
    if (!assets) return;
    scripts.add(assets.script);
    assets.styles.forEach((style) => styles.add(style));
  });

  const sourceAssets = sharedVisualizationAssetNodes([...styles, ...scripts]);
  const stylesReady = Promise.all(
    sourceAssets.filter((asset) => asset.tagName === "LINK").map(loadProblemVisualizationAsset),
  );
  for (const script of sourceAssets.filter((asset) => asset.tagName === "SCRIPT")) {
    await loadProblemVisualizationAsset(script);
  }
  await stylesReady;
}

function setPrimaryVisualizationSurface(visibleSurface) {
  PRIMARY_VISUALIZATION_SURFACES.forEach((surface) => {
    $(surface).classList.toggle("hidden", surface !== visibleSurface);
  });
}

const ORDERED_RENDERER_REGISTRY = [
    { predicate: (step) => Boolean(step.categories2782View), surface: "treeView", render: (step) => { renderUniqueCategories2782View(step); } },
    { predicate: (step) => Boolean(step.gcd3867View), surface: "treeView", render: (step) => { renderGcd3867View(step); } },
    { predicate: (step) => Boolean(step.ocean1762View), surface: "treeView", render: (step) => { renderOcean1762View(step); } },
    { predicate: (step) => Boolean(step.good1793View), surface: "treeView", render: (step) => { renderGoodSubarray1793View(step); } },
    { predicate: (step) => Boolean(step.k3644View), surface: "treeView", render: (step) => { renderK3644View(step); } },
    { predicate: (step) => Boolean(step.tradingStocks2291View), surface: "treeView", render: (step) => { renderTradingStocks2291View(step); } },
    { predicate: (step) => Boolean(step.matchsticks473View), surface: "treeView", render: (step) => { renderMatchsticks473View(step); } },
    { predicate: (step) => Boolean(step.pictureView || step.daily739View), surface: "treeView", render: (step) => { renderPictureLesson(step); } },
    { predicate: (step) => Boolean(step.subarray560View), surface: "treeView", render: (step) => {
      renderSubarray560Pictures(step);
    } },
    { predicate: (step) => Boolean(step.flatten114View), surface: "treeView", render: (step) => {
      renderFlatten114Pictures(step);
    } },
    { predicate: (step) => Boolean(step.atoi8View), surface: "treeView", render: (step) => {
      renderAtoi8Pictures(step);
    } },
    { predicate: (step) => Boolean(step.merge23View), surface: "treeView", render: (step) => {
      renderMergeKLists23Pictures(step);
    } },
    { predicate: (step) => Boolean(step.ladder127View), surface: "treeView", render: (step) => {
      renderWordLadder127Pictures(step);
    } },
    { predicate: (step) => Boolean(step.heaters475View), surface: "treeView", render: (step) => {
      renderHeaters475Pictures(step);
    } },
    { predicate: (step) => Boolean(step.minSwaps801View), surface: "treeView", render: (step) => {
      renderMinimumSwaps801Pictures(step);
    } },
    { predicate: (step) => Boolean(step.swap24View), surface: "treeView", render: (step) => {
      renderSwap24Pictures(step);
    } },
    { predicate: (step) => Boolean(step.sqrt69View), surface: "treeView", render: (step) => {
      renderSqrt69Pictures(step);
    } },
    { predicate: (step) => Boolean(step.matrixZero73View), surface: "treeView", render: (step) => {
      renderMatrixZero73Pictures(step);
    } },
    { predicate: (step) => Boolean(step.kthLargest215View), surface: "treeView", render: (step) => {
      renderKthLargest215Pictures(step);
    } },
    { predicate: (step) => Boolean(step.mapSum677View), surface: "treeView", render: (step) => {
      renderMapSum677Pictures(step);
    } },
    { predicate: (step) => Boolean(step.prefixScore2416View), surface: "treeView", render: (step) => {
      renderPrefixScores2416Pictures(step);
    } },
    { predicate: (step) => Boolean(step.wordDictionary211View), surface: "treeView", render: (step) => {
      renderWordDictionary211View(step);
    } },
    { predicate: (step) => Boolean(step.uniqueEmail929View), surface: "treeView", render: (step) => {
      renderUniqueEmail929View(step);
    } },
    { predicate: (step) => Boolean(step.lis300View), surface: "treeView", render: (step) => {
      renderLis300View(step);
    } },
    { predicate: (step) => Boolean(step.queue406View), surface: "treeView", render: (step) => {
      renderQueue406View(step);
    } },
    { predicate: (step) => Boolean(step.magnetic1552View), surface: "treeView", render: (step) => {
      renderMagneticForce1552View(step);
    } },
    { predicate: (step) => Boolean(step.bouquets1482View), surface: "treeView", render: (step) => {
      renderMinDaysBouquets1482View(step);
    } },
    { predicate: (step) => Boolean(step.smallestDivisor1283View), surface: "treeView", render: (step) => {
      renderSmallestDivisor1283View(step);
    } },
    { predicate: (step) => Boolean(step.safest2812View), surface: "treeView", render: (step) => {
      renderSafestPath2812View(step);
    } },
    { predicate: (step) => Boolean(step.safeDfs9021View), surface: "treeView", render: (step) => {
      renderSafeDfs9021View(step);
    } },
    { predicate: (step) => Boolean(step.effort1631View), surface: "treeView", render: (step) => {
      renderEffort1631View(step);
    } },
    { predicate: (step) => Boolean(step.maximin1102View), surface: "treeView", render: (step) => {
      renderMaximin1102View(step);
    } },
    { predicate: (step) => Boolean(step.swimDijkstra778View), surface: "treeView", render: (step) => {
      renderSwimRising778View(step);
    } },
    { predicate: (step) => Boolean(step.guessCost375View), surface: "treeView", render: (step) => {
      renderGuessCost375View(step);
    } },
    { predicate: (step) => Boolean(step.canIWin464View), surface: "treeView", render: (step) => {
      renderCanIWin464View(step);
    } },
    { predicate: (step) => Boolean(step.safeKruskal9021View), surface: "treeView", render: (step) => {
      renderSafeKruskal9021View(step);
    } },
    { predicate: (step) => Boolean(step.safeDijkstra9021View), surface: "treeView", render: (step) => {
      renderSafeDijkstra9021View(step);
    } },
    { predicate: (step) => Boolean(step.safePath9021View), surface: "treeView", render: (step) => {
      renderSafePath9021View(step);
    } },
    { predicate: (step) => Boolean(step.repairCars2594View), surface: "treeView", render: (step) => {
      renderRepairCars2594View(step);
    } },
    { predicate: (step) => Boolean(step.guessNumber374View), surface: "treeView", render: (step) => {
      renderGuessNumber374View(step);
    } },
    { predicate: (step) => Boolean(step.shipPackages1011View), surface: "treeView", render: (step) => {
      renderShipPackages1011View(step);
    } },
    { predicate: (step) => Boolean(step.divideChocolate1231View), surface: "treeView", render: (step) => {
      renderDivideChocolate1231View(step);
    } },
    { predicate: (step) => Boolean(step.kthMissing1539View), surface: "treeView", render: (step) => {
      renderKthMissing1539View(step);
    } },
    { predicate: (step) => Boolean(step.arrangingCoins441View), surface: "treeView", render: (step) => {
      renderArrangingCoins441View(step);
    } },
    { predicate: (step) => Boolean(step.koko875View), surface: "treeView", render: (step) => {
      renderKoko875View(step);
    } },
    { predicate: (step) => Boolean(step.palindrome1312View), surface: "treeView", render: (step) => {
      renderMinInsertionsPalindrome1312View(step);
    } },
    { predicate: (step) => Boolean(step.stringCompression1531View), surface: "treeView", render: (step) => {
      renderStringCompression1531View(step);
    } },
    { predicate: (step) => Boolean(step.cherryPickup1463View), surface: "treeView", render: (step) => {
      renderCherryPickup1463View(step);
    } },
    { predicate: (step) => Boolean(step.restoreArray1416View), surface: "treeView", render: (step) => {
      renderRestoreArray1416View(step);
    } },
    { predicate: (step) => Boolean(step.greatPartitions2518View), surface: "treeView", render: (step) => {
      renderGreatPartitions2518View(step);
    } },
    { predicate: (step) => Boolean(step.waysToEarnPoints2585View), surface: "treeView", render: (step) => {
      renderWaysToEarnPoints2585View(step);
    } },
    { predicate: (step) => Boolean(step.waysToExpressPowers2787View), surface: "treeView", render: (step) => {
      renderWaysToExpressPowers2787View(step);
    } },
    { predicate: (step) => Boolean(step.originalTypedString3333View), surface: "treeView", render: (step) => {
      renderOriginalTypedString3333View(step);
    } },
    { predicate: (step) => Boolean(step.sameAverage805View), surface: "treeView", render: (step) => {
      renderSplitArraySameAverage805View(step);
    } },
    { predicate: (step) => Boolean(step.closestSum1755View), surface: "treeView", render: (step) => {
      renderClosestSubsequenceSum1755View(step);
    } },
    { predicate: (step) => Boolean(step.partition2035View), surface: "treeView", render: (step) => {
      renderPartitionArray2035View(step);
    } },
    { predicate: (step) => Boolean(step.tallestBillboard956View), surface: "treeView", render: (step) => {
      renderTallestBillboard956View(step);
    } },
    { predicate: (step) => Boolean(step.paintingWalls2742View), surface: "treeView", render: (step) => {
      renderPaintingWalls2742View(step);
    } },
    { predicate: (step) => Boolean(step.sumPower3082View), surface: "treeView", render: (step) => {
      renderSumPower3082View(step);
    } },
    { predicate: (step) => Boolean(step.reward3180View), surface: "treeView", render: (step) => {
      renderMaximumTotalReward3180View(step);
    } },
    { predicate: (step) => Boolean(step.reward3181View), surface: "treeView", render: (step) => {
      renderMaximumTotalReward3181View(step);
    } },
    { predicate: (step) => Boolean(step.maximumEvenSplit2178View), surface: "treeView", render: (step) => {
      renderMaximumEvenSplit2178View(step);
    } },
    { predicate: (step) => Boolean(step.lastStoneWeight1046View), surface: "treeView", render: (step) => {
      renderLastStoneWeight1046View(step);
    } },
    { predicate: (step) => Boolean(step.profitableSchemes879View), surface: "treeView", render: (step) => {
      renderProfitableSchemes879View(step);
    } },
    { predicate: (step) => Boolean(step.onesZeros474View), surface: "treeView", render: (step) => {
      renderOnesAndZeroes474View(step);
    } },
    { predicate: (step) => Boolean(step.targetSum494View), surface: "treeView", render: (step) => {
      renderTargetSum494View(step);
    } },
    { predicate: (step) => Boolean(step.stoneWeight1049View), surface: "treeView", render: (step) => {
      renderLastStoneWeight1049View(step);
    } },
    { predicate: (step) => Boolean(step.bstTwoSum653View), surface: "treeView", render: (step) => {
      renderTwoSumBst653View(step);
    } },
    { predicate: (step) => Boolean(step.maximizeSquares2897View), surface: "treeView", render: (step) => {
      renderMaximizeSquares2897View(step);
    } },
    { predicate: (step) => Boolean(step.directorySize9023View), surface: "treeView", render: (step) => {
      renderDirectorySize9023View(step);
    } },
    { predicate: (step) => Boolean(step.springboardMatrix9020View), surface: "treeView", render: (step) => {
      renderSpringboardMatrix9020View(step);
    } },
    { predicate: (step) => Boolean(step.maxConsecutiveOnes1004View), surface: "treeView", render: (step) => {
      renderMaxConsecutiveOnes1004View(step);
    } },
    { predicate: (step) => Boolean(step.kSum2386View), surface: "treeView", render: (step) => {
      renderKSum2386View(step);
    } },
    { predicate: (step) => Boolean(step.stringChain1048View), surface: "treeView", render: (step) => {
      renderLongestStringChain1048View(step);
    } },
    { predicate: (step) => Boolean(step.stockPrice2034View), surface: "treeView", render: (step) => {
      renderStockPrice2034View(step);
    } },
    { predicate: (step) => Boolean(step.crossword2018View), surface: "treeView", render: (step) => {
      renderCrosswordPlacement2018View(step);
    } },
    { predicate: (step) => Boolean(step.snapshotArray1146View), surface: "treeView", render: (step) => {
      renderSnapshotArray1146View(step);
    } },
    { predicate: (step) => Boolean(step.fileSystem1166View), surface: "treeView", render: (step) => {
      renderFileSystem1166View(step);
    } },
    { predicate: (step) => Boolean(step.findReplace833View), surface: "treeView", render: (step) => {
      renderFindReplace833View(step);
    } },
    { predicate: (step) => Boolean(step.removeOnes2128View), surface: "treeView", render: (step) => {
      renderRemoveOnes2128View(step);
    } },
    { predicate: (step) => Boolean(step.detectSquares2013View), surface: "treeView", render: (step) => {
      renderDetectSquares2013View(step);
    } },
    { predicate: (step) => Boolean(step.cookingTime2162View), surface: "treeView", render: (step) => {
      renderCookingTime2162View(step);
    } },
    { predicate: (step) => Boolean(step.countWords2135View), surface: "treeView", render: (step) => {
      renderCountWords2135View(step);
    } },
    { predicate: (step) => Boolean(step.guessWord843View), surface: "treeView", render: (step) => {
      renderGuessTheWord843View(step);
    } },
    { predicate: (step) => Boolean(step.robotRoomCleaner489View), surface: "treeView", render: (step) => {
      renderRobotRoomCleaner489View(step);
    } },
    { predicate: (step) => Boolean(step.increasingCells2713View), surface: "treeView", render: (step) => {
      renderIncreasingCells2713View(step);
    } },
    { predicate: (step) => Boolean(step.increasingPaths2328View), surface: "treeView", render: (step) => {
      renderIncreasingPaths2328View(step);
    } },
    { predicate: (step) => Boolean(step.dessert1774View), surface: "treeView", render: (step) => {
      renderClosestDessertCost1774View(step);
    } },
    { predicate: (step) => Boolean(step.minimizeDifference1981View), surface: "treeView", render: (step) => {
      renderMinimizeDifference1981View(step);
    } },
    { predicate: (step) => Boolean(step.similarEnds1750View), surface: "treeView", render: (step) => {
      renderSimilarEnds1750View(step);
    } },
    { predicate: (step) => Boolean(step.rook999View), surface: "treeView", render: (step) => {
      renderAvailableCapturesForRook999View(step);
    } },
    { predicate: (step) => Boolean(step.dictionary524View), surface: "treeView", render: (step) => {
      renderDictionary524View(step);
    } },
    { predicate: (step) => Boolean(step.backspace844View), surface: "treeView", render: (step) => {
      renderBackspace844View(step);
    } },
    { predicate: (step) => Boolean(step.reverseLetters917View), surface: "treeView", render: (step) => {
      renderReverseLetters917View(step);
    } },
    { predicate: (step) => Boolean(step.reverseVowels345View), surface: "treeView", render: (step) => {
      renderReverseVowels345View(step);
    } },
    { predicate: (step) => Boolean(step.triplets1876View), surface: "treeView", render: (step) => {
      renderTriplets1876View(step);
    } },
    { predicate: (step) => Boolean(step.close1657View), surface: "treeView", render: (step) => {
      renderClose1657View(step);
    } },
    { predicate: (step) => Boolean(step.frequency451View), surface: "treeView", render: (step) => {
      renderFrequency451View(step);
    } },
    { predicate: (step) => Boolean(step.wordPattern290View), surface: "treeView", render: (step) => {
      renderWordPattern290View(step);
    } },
    { predicate: (step) => Boolean(step.palindrome409View), surface: "treeView", render: (step) => {
      renderPalindrome409View(step);
    } },
    { predicate: (step) => Boolean(step.difference389View), surface: "treeView", render: (step) => {
      renderDifference389View(step);
    } },
    { predicate: (step) => Boolean(step.anagram242View), surface: "treeView", render: (step) => {
      renderAnagram242View(step);
    } },
    { predicate: (step) => Boolean(step.anagram438View), surface: "treeView", render: (step) => {
      renderFindAnagrams438View(step);
    } },
    { predicate: (step) => Boolean(step.reverseWords151View), surface: "treeView", render: (step) => {
      renderReverseWords151View(step);
    } },
    { predicate: (step) => Boolean(step.reverseWords557View), surface: "treeView", render: (step) => {
      renderReverseWords557View(step);
    } },
    { predicate: (step) => Boolean(step.reverseString541View), surface: "treeView", render: (step) => {
      renderReverseString541View(step);
    } },
    { predicate: (step) => Boolean(step.goalParser1678View), surface: "treeView", render: (step) => {
      renderGoalParser1678View(step);
    } },
    { predicate: (step) => Boolean(step.equivalent1662View), surface: "treeView", render: (step) => {
      renderEquivalent1662View(step);
    } },
    { predicate: (step) => Boolean(step.defang1108View), surface: "treeView", render: (step) => {
      renderDefang1108View(step);
    } },
    { predicate: (step) => Boolean(step.lowerCase709View), surface: "treeView", render: (step) => {
      renderLowerCase709View(step);
    } },
    { predicate: (step) => Boolean(step.__live), surface: "liveVarsView", render: (step) => {
      renderLiveVarsView(step);
    } },
    { predicate: (step) => Boolean(step.vowelSubstrings3306View), surface: "treeView", render: (step) => {
      renderVowelSubstrings3306View(step);
    } },
    { predicate: (step) => Boolean(step.matchReplacement2301View), surface: "treeView", render: (step) => {
      renderMatchReplacement2301View(step);
    } },
    { predicate: (step) => Boolean(step.prefixSuffix745TrieView), surface: "treeView", render: (step) => {
      renderPrefixSuffix745TrieView(step);
    } },
    { predicate: (step) => Boolean(step.prefixSuffix745View), surface: "treeView", render: (step) => {
      renderPrefixSuffix745View(step);
    } },
    { predicate: (step) => Boolean(step.maximumDistance1855View), surface: "treeView", render: (step) => {
      renderMaximumDistance1855View(step);
    } },
    { predicate: (step) => Boolean(step.furthestHouses2078View || step.furthestHouses2078ScanView), surface: "treeView", render: (step) => {
      renderFurthestHouses2078View(step);
    } },
    { predicate: (step) => Boolean(step.validParenthesis678View), surface: "treeView", render: (step) => {
      renderValidParenthesis678View(step);
    } },
    { predicate: (step) => Boolean(step.equalSubset416View), surface: "treeView", render: (step) => {
      renderEqualSubset416View(step);
    } },
    { predicate: (step) => Boolean(step.equalSubset416BitsetView), surface: "treeView", render: (step) => {
      renderEqualSubset416BitsetView(step);
    } },
    { predicate: (step) => Boolean(step.longestSubsequence2915View), surface: "treeView", render: (step) => {
      renderLongestSubsequence2915View(step);
    } },
    { predicate: (step) => Boolean(step.disappearedNumbers448View), surface: "treeView", render: (step) => {
      renderDisappearedNumbers448View(step);
    } },
    { predicate: (step) => Boolean(step.specialCharacters3121View), surface: "treeView", render: (step) => {
      renderSpecialCharacters3121View(step);
    } },
    { predicate: (step) => Boolean(step.serverAllocator9018BitmaskView), surface: "treeView", render: (step) => {
      renderServerAllocator9018BitmaskView(step);
    } },
    { predicate: (step) => Boolean(step.infiniteSet2336BitmaskView), surface: "treeView", render: (step) => {
      renderInfiniteSet2336BitmaskView(step);
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
    { predicate: (step) => Boolean(step.houseRobberView) && step.houseRobberView.method !== "circular", surface: "treeView", render: (step) => {
      renderHouseRobber198View(step);
    } },
    { predicate: (step) => Boolean(step.houseRobberView) && step.houseRobberView.method === "circular", surface: "treeView", render: (step) => {
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
      renderCountingBits338View(step);
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
      renderPascal118View(step);
    } },
    { predicate: (step) => Boolean(step.fibonacciView), surface: "treeView", render: (step) => {
      renderFibonacci509View(step);
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
    { predicate: (step) => Boolean(step.parity905View), surface: "treeView", render: (step) => {
      renderSortParity905View(step);
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
    { predicate: (step) => Boolean(step.similar839View), surface: "treeView", render: (step) => {
      renderSimilarStringGroups839View(step);
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
    { predicate: (step) => Boolean(step.landDistance1162View), surface: "treeView", render: (step) => {
      renderLandDistance1162View(step);
    } },
    { predicate: (step) => Boolean(step.highestPeak1765View), surface: "treeView", render: (step) => {
      renderHighestPeak1765View(step);
    } },
    { predicate: (step) => Boolean(step.wallsGates286View), surface: "treeView", render: (step) => {
      renderWallsAndGates286View(step);
    } },
    { predicate: (step) => Boolean(step.shortestBridge934View), surface: "treeView", render: (step) => {
      renderShortestBridge934View(step);
    } },
    { predicate: (step) => Boolean(step.pacificAtlantic417View), surface: "treeView", render: (step) => {
      renderPacificAtlantic417View(step);
    } },
    { predicate: (step) => Boolean(step.largestColor1857View), surface: "treeView", render: (step) => {
      renderLargestColor1857View(step);
    } },
    { predicate: (step) => Boolean(step.safe802View), surface: "treeView", render: (step) => {
      renderSafeStates802View(step);
    } },
    { predicate: (step) => Boolean(step.allPathsDestination1059View), surface: "treeView", render: (step) => {
      renderAllPathsDestination1059View(step);
    } },
    { predicate: (step) => Boolean(step.sortItemsGroups1203View), surface: "treeView", render: (step) => {
      renderSortItemsGroups1203View(step);
    } },
    { predicate: (step) => Boolean(step.strangePrinterII1591View), surface: "treeView", render: (step) => {
      renderStrangePrinterII1591View(step);
    } },
    { predicate: (step) => Boolean(step.rankTransformMatrix1632View), surface: "treeView", render: (step) => {
      renderRankTransformMatrix1632View(step);
    } },
    { predicate: (step) => Boolean(step.course1462View), surface: "treeView", render: (step) => {
      renderCourse1462View(step);
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
      renderAutocomplete642View(step);
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
    { predicate: (step) => Boolean(step.substitutions3481View), surface: "treeView", render: (step) => {
      renderSubstitutions3481View(step);
    } },
    { predicate: (step) => Boolean(step.differentParentheses241View), surface: "treeView", render: (step) => {
      renderDifferentParentheses241View(step);
    } },
    { predicate: (step) => Boolean(step.minimizeExpression2232View), surface: "treeView", render: (step) => {
      renderMinimizeExpression2232View(step);
    } },
    { predicate: (step) => Boolean(step.lockedParentheses2116View), surface: "treeView", render: (step) => {
      renderLockedParentheses2116View(step);
    } },
    { predicate: (step) => Boolean(step.minInsertions1541View), surface: "treeView", render: (step) => {
      renderMinInsertions1541View(step);
    } },
    { predicate: (step) => Boolean(step.scoreParentheses856View), surface: "treeView", render: (step) => {
      renderScoreParentheses856View(step);
    } },
    { predicate: (step) => Boolean(step.removeOutermost1021View), surface: "treeView", render: (step) => {
      renderRemoveOutermost1021View(step);
    } },
    { predicate: (step) => Boolean(step.informEmployees1376View), surface: "treeView", render: (step) => {
      renderInformEmployees1376View(step);
    } },
    { predicate: (step) => Boolean(step.underpaidManagers9022View), surface: "treeView", render: (step) => {
      renderUnderpaidManagers9022View(step);
    } },
    { predicate: (step) => Boolean(step.fullBloomFlowers2251View), surface: "treeView", render: (step) => {
      renderFullBloomFlowers2251View(step);
    } },
    { predicate: (step) => Boolean(step.minimumInterval1851View), surface: "treeView", render: (step) => {
      renderMinimumInterval1851View(step);
    } },
    { predicate: (step) => Boolean(step.mostBeautifulItem2070View), surface: "treeView", render: (step) => {
      renderMostBeautifulItem2070View(step);
    } },
    { predicate: (step) => Boolean(step.parallel2050View), surface: "treeView", render: (step) => {
      renderParallelCourses2050View(step);
    } },
    { predicate: (step) => Boolean(step.courseSchedule207View), surface: "treeView", render: (step) => {
      renderCourseSchedule207View(step);
    } },
    { predicate: (step) => Boolean(step.graph), surface: "treeView", render: (step) => {
      renderGraph(step);
    } },
    { predicate: (step) => Boolean(step.minimumHeightTrees310View), surface: "treeView", render: (step) => {
      renderMinimumHeightTrees310View(step);
    } },
    { predicate: (step) => Boolean(step.sequenceReconstruction444View), surface: "treeView", render: (step) => {
      renderSequenceReconstruction444View(step);
    } },
    { predicate: (step) => Boolean(step.excel631View), surface: "treeView", render: (step) => {
      renderDesignExcel631View(step);
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
    { predicate: (step) => Boolean(step.nextGreater496View), surface: "treeView", render: (step) => {
      renderNextGreater496View(step);
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
    { predicate: (step) => step.prefix1DView?.kind === "range-sum-immutable", surface: "treeView", render: (step) => {
      renderRangeSum303View(step);
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
      renderMaximumProduct628View(step);
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
    { predicate: (step) => Boolean(step.knight1197View), surface: "treeView", render: (step) => {
      renderMinimumKnightMoves1197View(step);
    } },
    { predicate: (step) => Boolean(step.edgeEquilibrium2846View), surface: "treeView", render: (step) => {
      renderEdgeEquilibrium2846View(step);
    } },
    { predicate: (step) => Boolean(step.wonderful1915View), surface: "treeView", render: (step) => {
      renderWonderful1915View(step);
    } },
    { predicate: (step) => Boolean(step.paint2158View), surface: "treeView", render: (step) => {
      renderAmountPainted2158View(step);
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
    { predicate: (step) => Boolean(step.libRegister9019View), surface: "treeView", render: (step) => {
      renderLibRegister9019View(step);
    } },
    { predicate: (step) => Boolean(step.vending9012View), surface: "treeView", render: (step) => {
      renderVendingMachine9012View(step);
    } },
];

let stableVisualizationLayout = null;

function renderStep() {
  const step = steps[stepIndex];
  if (!step) return;

  const panel = $("vizPanel");
  panel.classList.toggle("ci1254-tracking", Boolean(step.closedIsland1254View));
  panel.classList.toggle("ci1568-daylight", Boolean(step.disconnect1568View));
  if (step.disconnect1568View) panel.dataset.theme = "light";
  else delete panel.dataset.theme;
  const preserveViewport = Boolean(step.prefixSuffix745View || step.prefixSuffix745TrieView || step.multiSlotPodiumView);
  const viewport = { left: window.scrollX, top: window.scrollY };
  panel.classList.toggle("ps745-stable-viewport", Boolean(step.prefixSuffix745View || step.prefixSuffix745TrieView));
  // Reserve the tallest frame seen in this run so shorter frames cannot pull
  // the viewport upward when the user is near the bottom of the page.
  if (!preserveViewport || stableVisualizationLayout?.steps !== steps || stableVisualizationLayout?.width !== panel.clientWidth) {
    panel.style.minHeight = "";
    stableVisualizationLayout = preserveViewport ? { steps, width: panel.clientWidth, height: 0 } : null;
  }

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
    const displayedAnswer = answerValue !== null && typeof answerValue === "object" ? JSON.stringify(answerValue) : answerValue;
    $("answer").textContent = t().answer(displayedAnswer);
    show("answer");
  } else {
    hide("answer");
  }

  if (preserveViewport) {
    stableVisualizationLayout.height = Math.max(stableVisualizationLayout.height, panel.getBoundingClientRect().height);
    panel.style.minHeight = `${Math.ceil(stableVisualizationLayout.height)}px`;
    window.scrollTo({ ...viewport, behavior: "instant" });
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
// ---- Lazy live Python editor shell ----
// The Monaco/Pyodide integration is parsed only after Edit & run code.
// =====================================================================

let liveMode = false;
let liveEditorRuntimePromise = null;

function liveEditorRuntimeAssetNode() {
  return [...document.querySelectorAll("template[data-live-editor-assets]")]
    .flatMap((template) => [...template.content.querySelectorAll("script[src]")])
    .find((asset) => {
      const src = asset.getAttribute("src");
      return src && new URL(src, document.baseURI).pathname.endsWith("/live-editor.js");
    });
}

function ensureLiveEditorRuntime() {
  if (liveEditorRuntimePromise) return liveEditorRuntimePromise;
  const sourceAsset = liveEditorRuntimeAssetNode();
  if (!sourceAsset) return Promise.reject(new Error("Live editor runtime not found"));
  liveEditorRuntimePromise = loadProblemVisualizationAsset(sourceAsset)
    .then(() => {
      if (typeof openLiveEditor !== "function") {
        throw new Error("Live editor runtime failed to initialize");
      }
    })
    .catch((error) => {
      liveEditorRuntimePromise = null;
      throw error;
    });
  return liveEditorRuntimePromise;
}

function resetLiveEditorShell() {
  $("liveExitBtn").classList.add("hidden");
  $("liveEditorWrap").classList.add("hidden");
  $("codePanel").classList.remove("hidden");
  $("liveEditBtn").classList.remove("hidden");
  $("codeBlurBtn").classList.remove("hidden");
  $("liveVarsView").classList.add("hidden");
  hide("liveError");
  $("liveStatus").textContent = "";
}

function resetLiveEditorState() {
  liveMode = false;
  setCodeSnippetBlurred(readCodeSnippetBlurPreference());
  if (typeof resetLoadedLiveEditorState === "function") {
    resetLoadedLiveEditorState();
    return;
  }
  resetLiveEditorShell();
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
  const button = $("liveEditBtn");
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  try {
    await ensureLiveEditorRuntime();
    await openLiveEditor();
  } catch (error) {
    showError("liveError", (error && error.message) || String(error));
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
});

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
