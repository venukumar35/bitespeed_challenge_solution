"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifyModule = void 0;
const common_1 = require("@nestjs/common");
const identify_service_1 = require("./identify.service");
const identify_controller_1 = require("./identify.controller");
const db_1 = require("../database/db");
let IdentifyModule = class IdentifyModule {
};
exports.IdentifyModule = IdentifyModule;
exports.IdentifyModule = IdentifyModule = __decorate([
    (0, common_1.Module)({
        controllers: [identify_controller_1.IdentifyController],
        providers: [identify_service_1.IdentifyService, db_1.PrismaService],
    })
], IdentifyModule);
//# sourceMappingURL=identify.module.js.map