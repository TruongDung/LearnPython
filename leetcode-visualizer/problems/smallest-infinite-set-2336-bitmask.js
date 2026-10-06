"use strict";

const SOURCE = Object.freeze([
  "class SmallestInfiniteSet:",
  "    def __init__(self):",
  "        self.removed = 0",
  "",
  "    def popSmallest(self) -> int:",
  "        free_bit = (self.removed + 1) & ~self.removed",
  "        smallest = free_bit.bit_length()",
  "        self.removed |= free_bit",
  "        return smallest",
  "",
  "    def addBack(self, num: int) -> None:",
  "        bit = 1 << (num - 1)",
  "        if self.removed & bit:",
  "            self.removed &= ~bit",
]);
const bi = (vi, en) => ({ vi, en });
const bitLength = value => value === 0n ? 0 : value.toString(2).length;

function buildSteps(input, parseOperations) {
  const operations = parseOperations(input);
  const steps = [];
  const outputs = [];
  const history = [];
  let removed = 0n;
  let operation = null;
  let calculation = null;
  let locals = {};
  const emit = (line, event, title, note, final = false) => {
    const minimum = bitLength((removed + 1n) & ~removed);
    steps.push({
      codeBlock: 2, codeLines: [line], final, arr: [],
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`), note,
      vars: [{ name: "self.removed", value: String(removed) }, ...Object.entries(locals).map(([name, value]) => ({ name, value: typeof value === "bigint" ? String(value) : value }))],
      infiniteSet2336BitmaskView: {
        line, source: SOURCE[line - 1], event, removed: String(removed), minimum,
        width: Math.max(16, bitLength(removed) + 3, minimum + 3),
        operation: operation ? { ...operation } : null,
        calculation: calculation ? { ...calculation } : null,
        history: history.map(entry => ({ ...entry })), outputs: [...outputs],
      },
    });
  };
  emit(2, "construct", bi("Khởi tạo SmallestInfiniteSet", "Construct SmallestInfiniteSet"), bi("Tập ban đầu chứa mọi số nguyên dương.", "The set initially contains every positive integer."));
  emit(3, "init-mask", bi("removed = 0", "removed = 0"), bi("Không số nào bị lấy: mọi bit đều là 0. Không cần lưu vô hạn bit 0.", "No number has been popped: all bits are 0. We do not need to store infinitely many zero bits."));
  operations.forEach((op, index) => {
    operation = { index, name: op.name, label: op.label, value: op.args[0] ?? null, accepted: null };
    calculation = null;
    locals = op.name === "addBack" ? { num: op.args[0] } : {};
    if (op.name === "popSmallest") {
      emit(5, "pop-call", bi("Gọi popSmallest()", "Call popSmallest()"), bi("Bit 0 thấp nhất là số nhỏ nhất vẫn còn trong tập.", "The lowest zero bit represents the smallest number still in the set."));
      const freeBit = (removed + 1n) & ~removed;
      locals.free_bit = freeBit;
      calculation = { kind: "pop", mask: String(removed), plusOne: String(removed + 1n), inverted: String(~removed), bit: String(freeBit) };
      emit(6, "find-zero", bi(`free_bit = (${removed} + 1) & ~${removed} = ${freeBit}`, `free_bit = (${removed} + 1) & ~${removed} = ${freeBit}`), bi("Cộng 1 đi qua các bit 1 thấp nhất; AND với ~removed giữ lại đúng bit 0 đầu tiên.", "Adding 1 carries through the trailing ones; AND with ~removed isolates the first zero bit."));
      const smallest = bitLength(freeBit);
      locals.smallest = smallest;
      operation.value = smallest;
      emit(7, "bit-to-number", bi(`smallest = free_bit.bit_length() = ${smallest}`, `smallest = free_bit.bit_length() = ${smallest}`), bi(`Bit ${smallest - 1} biểu diễn số ${smallest}.`, `Bit ${smallest - 1} represents number ${smallest}.`));
      removed |= freeBit;
      emit(8, "set-removed", bi(`Bật bit ${smallest - 1}: lấy số ${smallest}`, `Set bit ${smallest - 1}: pop number ${smallest}`), bi("Bit đổi 0 → 1: số này đã bị xóa khỏi tập.", "The bit changes 0 → 1: this number has been removed from the set."));
      outputs.push(smallest);
      history.push({ label: op.label, result: smallest });
      emit(9, "return", bi(`return ${smallest}`, `return ${smallest}`), bi("Trả về số nhỏ nhất vừa lấy.", "Return the smallest number just popped."));
    } else {
      const num = op.args[0];
      emit(11, "add-call", bi(`Gọi addBack(${num})`, `Call addBack(${num})`), bi("Chỉ số đã bị lấy mới cần thêm trở lại.", "Only a previously popped number needs restoring."));
      const bit = 1n << BigInt(num - 1);
      locals.bit = bit;
      calculation = { kind: "add", mask: String(removed), bit: String(bit), cleared: String(removed & ~bit) };
      emit(12, "make-bit", bi(`bit = 1 << ${num - 1}`, `bit = 1 << ${num - 1}`), bi(`Tạo mask chỉ có bit ${num - 1} của số ${num}.`, `Create a mask containing only bit ${num - 1} for number ${num}.`));
      operation.accepted = (removed & bit) !== 0n;
      emit(13, "check-removed", bi(`removed & bit → ${operation.accepted ? "True" : "False"}`, `removed & bit → ${operation.accepted ? "True" : "False"}`), bi(operation.accepted ? "Bit đang là 1: số này đã bị lấy, có thể trả lại." : "Bit là 0: số vẫn còn trong tập, nên bỏ qua.", operation.accepted ? "The bit is 1: the number was popped and can be restored." : "The bit is 0: the number is already present, so ignore the call."));
      if (operation.accepted) {
        removed &= ~bit;
        outputs.push(null);
        history.push({ label: op.label, result: null });
        emit(14, "clear-removed", bi(`Xóa bit ${num - 1}: thêm lại ${num}`, `Clear bit ${num - 1}: restore ${num}`), bi("Bit đổi 1 → 0: số này lại có thể được popSmallest lấy.", "The bit changes 1 → 0: popSmallest can take this number again."));
      } else {
        // addBack returns None implicitly; keep the completed output on the
        // condition frame without inventing an extra Python statement.
        outputs.push(null);
        history.push({ label: op.label, result: null });
        const last = steps.at(-1).infiniteSet2336BitmaskView;
        last.outputs = [...outputs];
        last.history = history.map(entry => ({ ...entry }));
      }
    }
  });
  operation = null;
  calculation = null;
  emit(steps.at(-1).codeLines[0], "done", bi("Hoàn tất cách bitmask", "Bitmask simulation complete"), bi(`Kết quả: ${JSON.stringify(outputs)}`, `Outputs: ${JSON.stringify(outputs)}`), true);
  return { original: operations.map(op => [op.name, ...op.args]), operations: operations.map(op => ({ name: op.name, args: [...op.args] })), answer: [...outputs], steps };
}

module.exports = { SOURCE, buildSteps };
