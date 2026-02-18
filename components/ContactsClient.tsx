"use client";

import { useState } from "react";
import { Contact } from "@/app/actions/contacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Plus, Mail, Briefcase, Trash2, Edit, Search, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import CreateContactDialog from "@/components/CreateContactDialog";
import { deleteContact } from "@/app/actions/contacts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ContactsClientProps {
  contacts: Contact[];
}

export default function ContactsClient({ contacts }: ContactsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.job_title && contact.job_title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const result = await deleteContact(id);
    if (result.success) {
      toast({
        title: "Contact deleted",
        description: "The contact has been deleted successfully",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditingContact(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f]">Contacts</h1>
          <p className="text-[#86868b] mt-2">Manage your frequently used approvers and contacts</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
        <Input
          type="text"
          placeholder="Search contacts by name, email, or job title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border border-[#d2d2d7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0071e3]/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-[#0071e3]" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{contacts.length}</p>
              <p className="text-sm text-[#86868b]">Total Contacts</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-[#d2d2d7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#1d1d1f]">
                {contacts.filter(c => c.usage_count > 0).length}
              </p>
              <p className="text-sm text-[#86868b]">Used Contacts</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-[#d2d2d7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#1d1d1f]">
                {contacts.filter(c => c.last_used_at).length}
              </p>
              <p className="text-sm text-[#86868b]">Recently Used</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <Card className="p-12 text-center border border-[#d2d2d7]">
          <User className="w-16 h-16 text-[#86868b] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
            {searchQuery ? "No contacts found" : "No contacts yet"}
          </h3>
          <p className="text-[#86868b] mb-6">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Add your first contact to get started with quick approver selection"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-md transition-all border border-[#d2d2d7]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-[#0071e3]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-[#0071e3]" />
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#1d1d1f]">
                          {contact.name}
                        </h3>
                        {contact.usage_count > 0 && (
                          <Badge variant="secondary" className="bg-[#0071e3]/10 text-[#0071e3] hover:bg-[#0071e3]/20">
                            Used {contact.usage_count}x
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[#86868b]">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{contact.email}</span>
                        </div>

                        {contact.job_title && (
                          <div className="flex items-center gap-2 text-[#86868b]">
                            <Briefcase className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{contact.job_title}</span>
                          </div>
                        )}

                        {contact.last_used_at && (
                          <div className="flex items-center gap-2 text-[#86868b]">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">
                              Last used {formatDate(contact.last_used_at)}
                            </span>
                          </div>
                        )}

                        {contact.notes && (
                          <p className="text-sm text-[#86868b] mt-2 italic">
                            {contact.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                      className="text-[#0071e3] hover:text-[#0077ed] hover:bg-[#0071e3]/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id, contact.name)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Contact Dialog */}
      <CreateContactDialog
        open={createDialogOpen}
        onOpenChange={handleDialogClose}
        contact={editingContact}
      />
    </div>
  );
}
