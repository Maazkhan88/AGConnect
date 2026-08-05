import Link from "next/link";

const items = ["Overview","Groups","Brands","Brand themes","Staff","Approvals","Cards & QR","Leads","Analytics","Audit logs"];
export default function AdminLayout({children}:{children:React.ReactNode}){return <div className="shell"><aside className="sidebar"><Link className="brand-mark" href="/">AG<span>CONNECT</span></Link><nav>{items.map((item,index)=><Link className={index===0?"active":""} href="/admin" key={item}>{item}</Link>)}</nav></aside><section className="workspace">{children}</section></div>}
