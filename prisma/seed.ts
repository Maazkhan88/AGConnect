import { PrismaClient } from "@prisma/client";
import { PERMISSIONS } from "../lib/auth/permissions";
const prisma=new PrismaClient();
async function main(){const group=await prisma.organizationGroup.upsert({where:{slug:"ag-holding"},update:{},create:{name:"AG Holding",slug:"ag-holding"}});for(const key of PERMISSIONS)await prisma.permission.upsert({where:{key},update:{},create:{key,description:key.replaceAll("."," ")}});for(const brand of [{name:"Northstar Advisory",slug:"northstar",displayName:"Northstar Advisory"},{name:"Sahra Living",slug:"sahra-living",displayName:"Sahra Living"},{name:"Aventra Systems",slug:"aventra",displayName:"Aventra Systems"}])await prisma.brand.upsert({where:{groupId_slug:{groupId:group.id,slug:brand.slug}},update:{},create:{...brand,groupId:group.id}});console.info("Seeded fictional AG Connect foundation data.")}
main().finally(()=>prisma.$disconnect());
