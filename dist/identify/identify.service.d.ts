import { CreateIdentifyDto } from "./dto/create-identify.dto";
import { PrismaService } from "src/database/db";
export declare class IdentifyService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createIdentifyDto: CreateIdentifyDto): Promise<{
        contact: {
            primaryContatctId: number;
            emails: string[];
            phoneNumbers: string[];
            secondaryContactIds: number[];
        };
    }[]>;
}
