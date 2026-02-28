import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, documents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Download, Trash2, PlusCircle } from "lucide-react";
import { addDocument, deleteDocument } from "./actions";

export default async function DocumentsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!dbUser || !dbUser.communityId) redirect("/onboarding");

    // Fetch documents with uploader details
    const allDocs = await db.select({
        id: documents.id,
        name: documents.name,
        category: documents.category,
        fileUrl: documents.fileUrl,
        createdAt: documents.createdAt,
        uploaderName: users.name,
    })
        .from(documents)
        .leftJoin(users, eq(documents.uploadedBy, users.id))
        .where(eq(documents.communityId, dbUser.communityId))
        .orderBy(desc(documents.createdAt));

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Vault</h1>
                <p className="text-slate-500 mt-1">Safely store and access community files.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {allDocs.length === 0 ? (
                            <div className="sm:col-span-2 text-center py-16 px-4 bg-white border border-dashed rounded-lg">
                                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 mb-1">No documents yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    Files uploaded by your admin will appear here securely.
                                </p>
                            </div>
                        ) : (
                            allDocs.map((doc) => (
                                <Card key={doc.id} className="flex flex-col">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">
                                                <FileText className="h-4 w-4" />
                                                {doc.category}
                                            </div>
                                            {dbUser.role === "admin" && (
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteDocument(doc.id);
                                                }}>
                                                    <Button type="submit" variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600 -mt-1 -mr-1">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                        <CardTitle className="text-base line-clamp-2" title={doc.name}>{doc.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 text-xs text-slate-500 flex-1">
                                        Uploaded by {doc.uploaderName} • {new Date(doc.createdAt).toLocaleDateString()}
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 mt-auto">
                                        <Button variant="outline" size="sm" className="w-full bg-slate-50" asChild>
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2 h-4 w-4" /> View / Download
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {dbUser.role === "admin" && (
                    <Card className="md:col-span-1 sticky top-6">
                        <CardHeader>
                            <CardTitle>Upload Document</CardTitle>
                            <CardDescription>Share a file with your community members.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={addDocument} className="space-y-4 text-sm">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="font-medium">File Name</label>
                                    <Input id="name" name="name" placeholder="E.g., 2024 Budget" required />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="category" className="font-medium">Category</label>
                                    <select name="category" id="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="General">General</option>
                                        <option value="Bylaws">Bylaws</option>
                                        <option value="Minutes">Meeting Minutes</option>
                                        <option value="Financial">Financials & Budgets</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="fileUrl" className="font-medium">File Link (URL)</label>
                                    <Input id="fileUrl" name="fileUrl" type="url" placeholder="https://..." required />
                                    <p className="text-xs text-slate-500">For V1, paste a link to Google Drive, Dropbox, or any public file URL.</p>
                                </div>

                                <Button type="submit" className="w-full mt-2">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Document
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
