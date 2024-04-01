import { IdentifyService } from './identify.service';
import { CreateIdentifyDto } from './dto/create-identify.dto';
export declare class IdentifyController {
    private readonly identifyService;
    constructor(identifyService: IdentifyService);
    create(createIdentifyDto: CreateIdentifyDto): Promise<{
        contact: {
            primaryContatctId: number;
            emails: string[];
            phoneNumbers: string[];
            secondaryContactIds: number[];
        };
    }[]>;
}
