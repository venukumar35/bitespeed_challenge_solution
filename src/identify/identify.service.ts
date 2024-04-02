import { Injectable } from "@nestjs/common";
import { CreateIdentifyDto } from "./dto/create-identify.dto";
import { PrismaService } from "src/database/db";
import { Prisma } from "@prisma/client";

@Injectable()
export class IdentifyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIdentifyDto: CreateIdentifyDto) {
    //Finding data in the existing data
    const findExistingData = await this.prisma.contact.findMany({
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
        createdAt: "asc",
      },
    });

    //Count the linkPrecedence
    const countExistingDataOflinkPrecedence =
      (await this.prisma.contact.count({
        where: {
          OR: [
            {
              email: createIdentifyDto.email,
            },
            {
              phoneNumber: createIdentifyDto.phoneNumber,
            },
          ],
          linkPrecedence: "Primary",
        },
      })) == 1;

    const collectDate = [];

    /**  Checking the findExistingData length greater than of
     * zero and requesting email and phoneNumber is not null
     */
    if (
      findExistingData.length > 0 &&
      createIdentifyDto.email != null &&
      createIdentifyDto.phoneNumber != null
    ) {
      for (let i = 0; i < findExistingData.length; i++) {
        const ele = findExistingData[i];
        /**
         * Checking the weather email or phoneNumber not equal to ethier
         * one of the existing data and linkPrecedence not equal to Seconday
         * and equal to Primary and linkedId is not null and checking the
         * linkPrecedence of Primary --( used to find an Primary existing data)
         */
        if (
          (ele.email != createIdentifyDto.email ||
            ele.phoneNumber != createIdentifyDto.phoneNumber) &&
          ele.linkPrecedence != "Secondary" &&
          ele.linkPrecedence == "Primary" &&
          ele.linkedId == null &&
          countExistingDataOflinkPrecedence
        ) {
          const findSecondaryData = await this.prisma.contact.findFirst({
            where: {
              email: createIdentifyDto.email,
              phoneNumber: createIdentifyDto.phoneNumber,
              linkPrecedence: "Secondary",
            },
          });

          if (
            !findSecondaryData &&
            (ele.email != createIdentifyDto.email ||
              ele.phoneNumber != createIdentifyDto.phoneNumber)
          ) {
            //creating the new Secondary data
            await this.prisma.contact.create({
              data: {
                email: createIdentifyDto.email,
                phoneNumber: createIdentifyDto.phoneNumber,
                linkPrecedence: "Secondary",
                linkedId: ele.id,
              },
            });
          }
          break;
        } else if (
          /** Checking the weather email or phoneNumber  equal to ethier
           *  one of the existing data and is primary and linkedId is null
           */
          (ele.email == createIdentifyDto.email ||
            ele.phoneNumber == createIdentifyDto.phoneNumber) &&
          ele.linkPrecedence == "Primary" &&
          ele.linkedId == null
        ) {
          //Pushing a date of the primary data to array
          collectDate.push(new Date(ele.createdAt));
        }
      }
    }

    if (collectDate.length > 0) {
      //Finding a minimum date in the array
      const minDate = new Date(Math.min.apply(null, collectDate));

      const pushIdentifyId = findExistingData.map((ele) => {
        return ele.id;
      });
      //Finding a primary data
      const findExistingDataByMinDate = await this.prisma.contact.findFirst({
        where: {
          createdAt: minDate,
          linkPrecedence: "Primary",
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

      //Removing the primary id from an array
      const filteredId = pushIdentifyId.filter(
        (number) => number !== findExistingDataByMinDate.id
      );

      //updating primary data to seconday data
      filteredId.map(async (ele) => {
        await this.prisma.contact.updateMany({
          where: {
            id: ele,
          },
          data: {
            linkedId: findExistingDataByMinDate.id,
            linkPrecedence: "Secondary",
          },
        });

        await this.prisma.contact.updateMany({
          where: {
            linkedId: ele,
          },
          data: {
            linkedId: findExistingDataByMinDate.id,
            linkPrecedence: "Secondary",
          },
        });
      });
    }

    //Checking is data is existing and requesting email and phoneNumber is not null
    if (
      findExistingData.length == 0 &&
      createIdentifyDto.email != null &&
      createIdentifyDto.phoneNumber != null
    ) {
      await this.prisma.contact.create({
        data: {
          email: createIdentifyDto.email,
          phoneNumber: createIdentifyDto.phoneNumber,
          linkPrecedence: "Primary",
        },
      });
    }
    const findingUpdateExistingData = await this.prisma.contact.findMany({
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
        createdAt: "asc",
      },
    });
    //Iterating a linkedid from existing data
    const linkedIdFromData = findingUpdateExistingData.map((ele) => {
      if (ele.linkedId != null) {
        return ele.linkedId;
      }
    });

    //Iterating a id from existing data
    const idOfExistData = findingUpdateExistingData.map((ele) => {
      if (ele.linkPrecedence == "Primary") {
        return ele.id;
      }
    });

    type filteredDataType = {
      id: number;
      email: string;
      phoneNumber: string;
      linkedId: number;
      linkPrecedence: string;
    };
    const filteredResponseData: filteredDataType[] = [];
    //Removing duplicate linkedId
    const uniquieLinkedId = new Set(linkedIdFromData.filter(Boolean));

    //Removing duplicate id
    const uniquieId = new Set(idOfExistData.filter(Boolean));

    if (uniquieId != undefined || uniquieLinkedId != undefined) {
      //Filtering the data by id or linkedId from existing data
      const filter: Prisma.ContactWhereInput = {
        OR: [
          {
            id: {
              in: Array.from(uniquieId.size == 0 ? uniquieLinkedId : uniquieId),
            },
          },
          {
            linkedId: {
              in: Array.from(
                uniquieLinkedId.size == 0 ? uniquieId : uniquieLinkedId
              ),
            },
          },
        ],
      };
      const filteredResponse = await this.prisma.contact.findMany({
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

    type mapType = Map<
      string,
      {
        primaryContatctId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
      }
    >;
    const structuringData: mapType = new Map();

    const finalResponseData: {
      contact: {
        primaryContatctId: number;
        emails: string[];
        phoneNumbers: string[];
        secondaryContactIds: number[];
      };
    }[] = [];
    for (let i = 0; i < filteredResponseData.length; i++) {
      const ele = filteredResponseData[i];
      if (structuringData.has(ele.linkedId?.toString())) {
        //Getting a data from map by using an linkedId
        const updateData = structuringData.get(ele.linkedId?.toString());

        //Cheking the email is not null and checking the email is existing in the map
        if (
          ele.email !== null &&
          !updateData.emails.includes(ele.email.toString())
        ) {
          updateData.emails.push(ele.email.toString());
        }

        //Cheking the phoneNumber is not null and checking the phoneNumber is existing in the map
        if (
          ele.phoneNumber !== null &&
          !updateData.phoneNumbers.includes(ele.phoneNumber.toString())
        ) {
          updateData.phoneNumbers.push(ele.phoneNumber.toString());
        }

        //Cheking the linkPrecedence is not null and checking the linkPrecedence is existing in the map

        if (
          ele.linkPrecedence == "Secondary" &&
          !updateData.secondaryContactIds.push(ele.id)
        ) {
          updateData.secondaryContactIds.push(ele.id);
        }
      } else {
        if (ele.linkedId == null) {
          const finalResponse = {
            primaryContatctId: ele.id,
            emails: [ele.email.toString() == null ? undefined : ele.email],
            phoneNumbers: [
              ele.phoneNumber == null ? undefined : ele.phoneNumber,
            ],
            secondaryContactIds: [],
          };
          //Setting a data in the map
          structuringData.set(ele.id.toString(), finalResponse);

          finalResponseData.push({ contact: finalResponse });
        }
      }
    }

    return finalResponseData;
  }
}
