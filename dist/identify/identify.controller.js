"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifyController = void 0;
const identify_service_1 = require("./identify.service");
const create_identify_dto_1 = require("./dto/create-identify.dto");
const common_1 = require("@nestjs/common");
let IdentifyController = class IdentifyController {
    constructor(identifyService) {
        this.identifyService = identifyService;
    }
    create(createIdentifyDto) {
        return this.identifyService.create(createIdentifyDto);
    }
};
exports.IdentifyController = IdentifyController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_identify_dto_1.CreateIdentifyDto]),
    __metadata("design:returntype", void 0)
], IdentifyController.prototype, "create", null);
exports.IdentifyController = IdentifyController = __decorate([
    (0, common_1.Controller)('identify'),
    __metadata("design:paramtypes", [identify_service_1.IdentifyService])
], IdentifyController);
//# sourceMappingURL=identify.controller.js.map