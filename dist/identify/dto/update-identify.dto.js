"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIdentifyDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_identify_dto_1 = require("./create-identify.dto");
class UpdateIdentifyDto extends (0, mapped_types_1.PartialType)(create_identify_dto_1.CreateIdentifyDto) {
}
exports.UpdateIdentifyDto = UpdateIdentifyDto;
//# sourceMappingURL=update-identify.dto.js.map