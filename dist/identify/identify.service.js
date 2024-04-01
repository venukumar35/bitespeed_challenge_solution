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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifyService = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("../database/db");
let IdentifyService = class IdentifyService {
    constructor(primsa) {
        this.primsa = primsa;
    }
    async create(createIdentifyDto) {
        const findExistingData = await this.primsa.contact.findMany({
            where: {
                OR: [
                    {
                        email: createIdentifyDto.email,
                    },
                    {
                        phoneNumber: createIdentifyDto.phoneNumber,
                    },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const countExistingDataOflinkPrecedence = (await this.primsa.contact.count({
            where: {
                OR: [
                    {
                        email: createIdentifyDto.email,
                    },
                    {
                        phoneNumber: createIdentifyDto.phoneNumber,
                    },
                ],
                linkPrecedence: 'Primary',
            },
        })) == 1;
        const collectDate = [];
        if (findExistingData.length > 0 &&
            createIdentifyDto.email != null &&
            createIdentifyDto.phoneNumber != null) {
            for (let i = 0; i < findExistingData.length; i++) {
                const ele = findExistingData[i];
                if ((ele.email != createIdentifyDto.email ||
                    ele.phoneNumber != createIdentifyDto.phoneNumber) &&
                    ele.linkPrecedence != 'Secondary' &&
                    ele.linkPrecedence == 'Primary' &&
                    ele.linkedId == null &&
                    countExistingDataOflinkPrecedence) {
                    await this.primsa.contact.create({
                        data: {
                            email: createIdentifyDto.email,
                            phoneNumber: createIdentifyDto.phoneNumber,
                            linkPrecedence: 'Secondary',
                            linkedId: ele.id,
                        },
                    });
                    break;
                }
                else if ((ele.email == createIdentifyDto.email ||
                    ele.phoneNumber == createIdentifyDto.phoneNumber) &&
                    ele.linkPrecedence == 'Primary' &&
                    ele.linkedId == null) {
                    collectDate.push(new Date(ele.createdAt));
                }
            }
        }
        if (collectDate.length > 0) {
            const minDate = new Date(Math.min.apply(null, collectDate));
            const pushIdentifyId = findExistingData.map((ele) => {
                return ele.id;
            });
            const findExistingDataByMinDate = await this.primsa.contact.findFirst({
                where: {
                    createdAt: minDate,
                    linkPrecedence: 'Primary',
                    linkedId: null,
                    OR: [
                        {
                            email: createIdentifyDto.email,
                        },
                        {
                            phoneNumber: createIdentifyDto.phoneNumber,
                        },
                    ],
                },
            });
            const filteredId = pushIdentifyId.filter((number) => number !== findExistingDataByMinDate.id);
            filteredId.map(async (ele) => {
                await this.primsa.contact.updateMany({
                    where: {
                        id: ele,
                    },
                    data: {
                        linkedId: findExistingDataByMinDate.id,
                        linkPrecedence: 'Secondary',
                    },
                });
                await this.primsa.contact.updateMany({
                    where: {
                        linkedId: ele,
                    },
                    data: {
                        linkedId: findExistingDataByMinDate.id,
                        linkPrecedence: 'Secondary',
                    },
                });
            });
        }
        if (findExistingData.length == 0 &&
            createIdentifyDto.email != null &&
            createIdentifyDto.phoneNumber != null) {
            await this.primsa.contact.create({
                data: {
                    email: createIdentifyDto.email,
                    phoneNumber: createIdentifyDto.phoneNumber,
                    linkPrecedence: 'Primary',
                },
            });
        }
        const findingUpdateExistingData = await this.primsa.contact.findMany({
            where: {
                OR: [
                    {
                        email: createIdentifyDto.email,
                    },
                    {
                        phoneNumber: createIdentifyDto.phoneNumber,
                    },
                ],
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const linkedIdFromData = findingUpdateExistingData.map((ele) => {
            if (ele.linkedId != null) {
                return ele.linkedId;
            }
        });
        const idOfExistData = findingUpdateExistingData.map((ele) => {
            if (ele.linkPrecedence == 'Primary') {
                return ele.id;
            }
        });
        const filteredResponseData = [];
        const uniquieLinkedId = new Set(linkedIdFromData.filter(Boolean));
        const uniquieId = new Set(idOfExistData.filter(Boolean));
        if (uniquieId != undefined || uniquieLinkedId != undefined) {
            const filter = {
                OR: [
                    {
                        id: {
                            in: Array.from(uniquieId.size == 0 ? uniquieLinkedId : uniquieId),
                        },
                    },
                    {
                        linkedId: {
                            in: Array.from(uniquieLinkedId.size == 0 ? uniquieId : uniquieLinkedId),
                        },
                    },
                ],
            };
            const filteredResponse = await this.primsa.contact.findMany({
                where: filter,
            });
            filteredResponse.forEach((ele1) => {
                filteredResponseData.push({
                    email: ele1.email,
                    phoneNumber: ele1.phoneNumber,
                    id: ele1.id,
                    linkedId: ele1.linkedId,
                    linkPrecedence: ele1.linkPrecedence,
                });
            });
        }
        const structuringData = new Map();
        const finalResponseData = [];
        for (let i = 0; i < filteredResponseData.length; i++) {
            const ele = filteredResponseData[i];
            if (structuringData.has(ele.linkedId?.toString())) {
                const updateData = structuringData.get(ele.linkedId?.toString());
                if (ele.email !== null &&
                    !updateData.emails.includes(ele.email.toString())) {
                    updateData.emails.push(ele.email.toString());
                }
                if (ele.phoneNumber !== null &&
                    !updateData.phoneNumbers.includes(ele.phoneNumber.toString())) {
                    updateData.phoneNumbers.push(ele.phoneNumber.toString());
                }
                if (ele.linkPrecedence == 'Secondary' &&
                    !updateData.secondaryContactIds.push(ele.id)) {
                    updateData.secondaryContactIds.push(ele.id);
                }
            }
            else {
                if (ele.linkedId == null) {
                    const finalResponse = {
                        primaryContatctId: ele.id,
                        emails: [ele.email.toString() == null ? undefined : ele.email],
                        phoneNumbers: [
                            ele.phoneNumber == null ? undefined : ele.phoneNumber,
                        ],
                        secondaryContactIds: [],
                    };
                    structuringData.set(ele.id.toString(), finalResponse);
                    finalResponseData.push({ contact: finalResponse });
                }
            }
        }
        return finalResponseData;
    }
};
exports.IdentifyService = IdentifyService;
exports.IdentifyService = IdentifyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [db_1.PrismaService])
], IdentifyService);
//# sourceMappingURL=identify.service.js.map