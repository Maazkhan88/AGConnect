export const PERMISSIONS=[
  "group.read","group.manage","brand.create","brand.read","brand.update","brand.archive","brand.theme.manage","brand.template.manage","brand.files.manage","department.create","department.read","department.update","team.manage","staff.create","staff.read","staff.update","staff.archive","staff.invite","staff.import","staff.assign_brand","staff.assign_card","profile.read","profile.update","profile.publish","profile.approve","profile.suspend","card.create","card.read","card.assign","card.reassign","card.suspend","card.retire","qr.create","qr.read","qr.update","qr.suspend","lead.read","lead.update","lead.assign","lead.export","campaign.create","campaign.manage","analytics.staff","analytics.brand","analytics.group","audit.read","integration.manage","settings.manage"
] as const;
export type Permission=(typeof PERMISSIONS)[number];
export type AuthorizationContext={groupId:string;brandIds:ReadonlySet<string>;permissions:ReadonlySet<Permission>};
export type ResourceScope={groupId:string;brandId?:string|null};
export function can(context:AuthorizationContext,permission:Permission,resource:ResourceScope):boolean{
  if(!context.permissions.has(permission)||context.groupId!==resource.groupId)return false;
  return resource.brandId==null||context.brandIds.has(resource.brandId)||context.permissions.has("group.manage");
}
export function assertCan(context:AuthorizationContext,permission:Permission,resource:ResourceScope):void{if(!can(context,permission,resource))throw new Error("FORBIDDEN")}
