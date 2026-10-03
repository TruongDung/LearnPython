"use strict";

const SOURCE = Object.freeze([
  "class ServerAllocator:",
  "    def __init__(self, existing_inventory):",
  "        self.init(existing_inventory)",
  "",
  "    def init(self, existing_inventory):",
  "        self.used_masks = {}",
  "        for name in existing_inventory:",
  "            server_type, suffix = name.rsplit(\"-\", 1)",
  "            number = int(suffix)",
  "            mask = self.used_masks.get(server_type, 0)",
  "            self.used_masks[server_type] = mask | (1 << (number - 1))",
  "",
  "    def allocate(self, server_type):",
  "        mask = self.used_masks.get(server_type, 0)",
  "        free_bit = (mask + 1) & ~mask",
  "        number = free_bit.bit_length()",
  "        self.used_masks[server_type] = mask | free_bit",
  "        return f\"{server_type}-{number}\"",
  "",
  "    def deallocate(self, name):",
  "        server_type, suffix = name.rsplit(\"-\", 1)",
  "        number = int(suffix)",
  "        mask = self.used_masks.get(server_type, 0)",
  "        bit = 1 << (number - 1)",
  "        if not (mask & bit):",
  "            return",
  "        self.used_masks[server_type] = mask & ~bit",
]);

const bi = (vi, en) => ({ vi, en });
const bitLength = value => value === 0n ? 0 : value.toString(2).length;
const lowestFree = mask => (mask + 1n) & ~mask;

function buildSteps(input, params, parseInput) {
  const { inventory, operations } = parseInput(input, params);
  const masks = new Map();
  const steps = [];
  const outputs = [];
  const history = [];
  let operation = null;
  let calculation = null;
  let locals = {};
  const emit = (line, event, title, note, final = false) => {
    const typeStates = [...masks];
    if (operation?.serverType && operation.kind !== "deallocate" && !masks.has(operation.serverType)) typeStates.push([operation.serverType, 0n]);
    const types = typeStates.sort(([a], [b]) => a.localeCompare(b)).map(([serverType, mask]) => {
      const minimum = bitLength(lowestFree(mask));
      return { serverType, mask: String(mask), minimum, preview: !masks.has(serverType), width: Math.max(12, bitLength(mask) + 2, minimum + 2) };
    });
    steps.push({
      codeBlock: 2, codeLines: [line], final,
      title: bi(`Dòng ${line}: ${title.vi}`, `Line ${line}: ${title.en}`),
      note, arr: [],
      vars: Object.entries(locals).map(([name, value]) => ({ name, value: typeof value === "bigint" ? String(value) : value })),
      serverAllocator9018BitmaskView: {
        line, event, source: SOURCE[line - 1],
        types,
        operation: operation ? { ...operation } : null,
        calculation: calculation ? { ...calculation } : null,
        history: history.map(entry => ({ ...entry })),
        outputs: [...outputs],
      },
    });
  };
  emit(2, "construct", bi("Khởi tạo ServerAllocator", "Construct ServerAllocator"), bi("Mỗi loại server có một integer mask: bit 1 là ID đang dùng, bit 0 là ID trống.", "Each server type has an integer mask: 1 means allocated, 0 means available."));
  emit(3, "call-init", bi("Gọi init(inventory)", "Call init(inventory)"), bi("Đọc inventory để bật các bit ID đang dùng.", "Read the inventory to set the bits of allocated IDs."));
  emit(6, "init-masks", bi("used_masks = {}", "used_masks = {}"), bi("Không cần heap hoặc next_id ở cách này.", "This approach needs neither a heap nor next_id."));
  inventory.forEach(name => {
    operation = { kind: "init", arg: name, serverType: null, number: null };
    locals = { name };
    emit(7, "inventory-loop", bi(`Đọc ${name}`, `Read ${name}`), bi("Lấy tên server tiếp theo.", "Take the next server name."));
    const separator = name.lastIndexOf('-');
    const serverType = name.slice(0, separator);
    const suffix = name.slice(separator + 1);
    operation.serverType = serverType;
    locals = { ...locals, server_type: serverType, suffix };
    emit(8, "split-name", bi(`Tách loại ${serverType}`, `Split type ${serverType}`), bi("Tách ở dấu gạch nối cuối để hỗ trợ loại có dấu gạch nối.", "Split at the final hyphen to support hyphenated types."));
    const number = Number(suffix);
    operation.number = number;
    locals.number = number;
    emit(9, "parse-number", bi(`number = ${number}`, `number = ${number}`), bi(`ID ${number} dùng bit ${number - 1}.`, `ID ${number} uses bit ${number - 1}.`));
    const mask = masks.get(serverType) ?? 0n;
    locals.mask = mask;
    emit(10, "read-mask", bi(`mask = ${mask}`, `mask = ${mask}`), bi("Loại chưa có bắt đầu với mask 0: mọi ID đều trống.", "An unseen type starts with mask 0: all IDs are available."));
    masks.set(serverType, mask | (1n << BigInt(number - 1)));
    emit(11, "set-initial-bit", bi(`Bật bit ${number - 1} cho ${name}`, `Set bit ${number - 1} for ${name}`), bi("OR chỉ bật bit của ID này; các ID khác giữ nguyên.", "OR sets only this ID's bit; other IDs are unchanged."));
  });
  operation = null;
  emit(7, "inventory-done", bi("Đã đọc hết inventory", "Inventory exhausted"), bi("Bit 0 thấp nhất là ID trống nhỏ nhất, kể cả ID chưa từng được cấp.", "The lowest zero bit is the smallest available ID, including never-issued IDs."));

  for (const op of operations) {
    operation = { ...op, result: null };
    calculation = null;
    locals = op.kind === "allocate" ? { server_type: op.serverType } : { name: op.arg };
    emit(op.kind === "allocate" ? 13 : 20, "call", bi(op.display, op.display), bi("Chỉ mask của đúng loại server được thao tác.", "Only this server type's mask is affected."));
    if (op.kind === "allocate") {
      const mask = masks.get(op.serverType) ?? 0n;
      locals.mask = mask;
      emit(14, "read-mask", bi(`mask = ${mask}`, `mask = ${mask}`), bi("Đọc mask hiện tại; chưa thay đổi bit.", "Read the current mask; no bits change yet."));
      const freeBit = lowestFree(mask);
      locals.free_bit = freeBit;
      calculation = { kind: "allocate", mask: String(mask), plusOne: String(mask + 1n), inverted: String(~mask), freeBit: String(freeBit) };
      emit(15, "find-zero", bi(`free_bit = (${mask} + 1) & ~${mask} = ${freeBit}`, `free_bit = (${mask} + 1) & ~${mask} = ${freeBit}`), bi("+1 vượt qua dãy bit 1 ở thấp nhất; AND với ~mask chỉ giữ bit 0 đầu tiên vừa được bật.", "+1 carries through the trailing 1s; AND with ~mask keeps only the first zero bit that was set."));
      const number = bitLength(freeBit);
      operation.number = number;
      locals.number = number;
      emit(16, "bit-to-id", bi(`number = free_bit.bit_length() = ${number}`, `number = free_bit.bit_length() = ${number}`), bi(`Bit ${number - 1} tương ứng ID ${number}.`, `Bit ${number - 1} corresponds to ID ${number}.`));
      masks.set(op.serverType, mask | freeBit);
      emit(17, "set-used", bi(`Bật bit ${number - 1}: cấp ${op.serverType}-${number}`, `Set bit ${number - 1}: allocate ${op.serverType}-${number}`), bi("Bit đổi 0 → 1; ID này không còn trống.", "The bit changes 0 → 1; this ID is no longer available."));
      operation.result = `${op.serverType}-${number}`;
      outputs.push(operation.result);
      history.push({ call: op.display, result: operation.result });
      emit(18, "return-name", bi(`Trả về ${operation.result}`, `Return ${operation.result}`), bi("Đã cấp đúng ID trống nhỏ nhất của loại này.", "Allocated this type's smallest available ID."));
    } else {
      locals.server_type = op.serverType;
      locals.suffix = String(op.number);
      emit(21, "split-name", bi(`Tách ${op.arg}`, `Split ${op.arg}`), bi("Tìm loại và hậu tố ID.", "Find the type and ID suffix."));
      locals.number = op.number;
      emit(22, "parse-number", bi(`number = ${op.number}`, `number = ${op.number}`), bi("Đổi hậu tố thành số nguyên.", "Convert the suffix to an integer."));
      const mask = masks.get(op.serverType) ?? 0n;
      locals.mask = mask;
      emit(23, "read-mask", bi(`mask = ${mask}`, `mask = ${mask}`), bi("Loại chưa tồn tại dùng mask 0 nhưng không tạo entry mới.", "An unknown type uses mask 0 without creating a new entry."));
      const bit = 1n << BigInt(op.number - 1);
      locals.bit = bit;
      calculation = { kind: "deallocate", mask: String(mask), bit: String(bit), cleared: String(mask & ~bit) };
      emit(24, "make-bit", bi(`bit = 1 << ${op.number - 1}`, `bit = 1 << ${op.number - 1}`), bi("Tạo mask chỉ có bit của ID cần trả.", "Make a mask containing only the ID's bit."));
      const absent = (mask & bit) === 0n;
      operation.ignored = absent;
      emit(25, "check-used", bi(`not (mask & bit) → ${absent ? "True" : "False"}`, `not (mask & bit) → ${absent ? "True" : "False"}`), bi(absent ? "ID không được cấp: bỏ qua để tránh thay đổi trạng thái." : "ID đang được cấp: có thể xóa bit.", absent ? "ID is unallocated: ignore it to preserve state." : "ID is allocated: its bit may be cleared."));
      if (absent) {
        outputs.push(null);
        history.push({ call: op.display, result: null });
        emit(26, "ignore", bi("Bỏ qua, trả về None", "Ignore, return None"), bi("Mask giữ nguyên, kể cả khi trả cùng ID nhiều lần.", "The mask is unchanged, including repeated deallocation."));
      } else {
        masks.set(op.serverType, mask & ~bit);
        outputs.push(null);
        history.push({ call: op.display, result: null });
        emit(27, "clear-used", bi(`Xóa bit ${op.number - 1}: trả ${op.arg}`, `Clear bit ${op.number - 1}: release ${op.arg}`), bi("Bit đổi 1 → 0; lần allocate sau có thể lấy ID này.", "The bit changes 1 → 0; a later allocate may reuse this ID."));
      }
    }
  }
  operation = null;
  calculation = null;
  emit(steps.at(-1).codeLines[0], "done", bi("Hoàn tất cách bitmask", "Bitmask simulation complete"), bi(`Kết quả: ${JSON.stringify(outputs)}`, `Outputs: ${JSON.stringify(outputs)}`), true);
  return { original: [...inventory], answer: [...outputs], operations: operations.map(op => ({ name: op.kind, args: [op.arg] })), steps };
}

module.exports = { SOURCE, buildSteps };
