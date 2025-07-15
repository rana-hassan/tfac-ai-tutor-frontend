
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { LayoutItem } from "@/api/entities";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Save, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LayoutManagerPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser && currentUser.role === 'admin') {
          setIsAdmin(true);
          
          const defaultNavItems = [
            { path: "Chat", label: "Chat", icon: "MessageCircle", order: 0, isVisible: true },
            { path: "Progress", label: "Progress", icon: "TrendingUp", order: 1, isVisible: true },
            { path: "Leaderboard", label: "Leadership Board", icon: "Trophy", order: 2, isVisible: true },
            { path: "Competency", label: "Competency Map", icon: "Shapes", order: 3, isVisible: true }
          ];

          let allItems = await LayoutItem.list();
          const uniqueItemsMap = new Map();

          // Deduplicate existing items by path, keeping the first one encountered.
          // This ensures that if duplicate paths exist in the database, only one is considered.
          allItems.forEach(item => {
            if (!uniqueItemsMap.has(item.path)) {
              uniqueItemsMap.set(item.path, item);
            }
          });

          const itemsToCreate = [];
          defaultNavItems.forEach(defaultItem => {
            if (!uniqueItemsMap.has(defaultItem.path)) {
              itemsToCreate.push(defaultItem);
            }
          });

          // If any default items are missing, create them.
          if (itemsToCreate.length > 0) {
            toast({
              title: "Reconciling Layout",
              description: `Adding ${itemsToCreate.length} missing default item(s).`,
            });
            await LayoutItem.bulkCreate(itemsToCreate);
            // Re-fetch all items to get a complete list with new IDs
            allItems = await LayoutItem.list();
            // Re-run deduplication to include newly created items and ensure uniqueness
            uniqueItemsMap.clear();
            allItems.forEach(item => {
              if (!uniqueItemsMap.has(item.path)) {
                uniqueItemsMap.set(item.path, item);
              }
            });
          }
          
          const finalItems = Array.from(uniqueItemsMap.values());
          setItems(finalItems.sort((a, b) => a.order - b.order));
        }
      } catch (error) {
        console.error("Error in Layout Manager:", error);
        toast({
          title: "Error",
          description: "Could not load or initialize layout items.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminAndLoad();
  }, [toast]);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(items);
    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property
    const updatedItems = reorderedItems.map((item, index) => ({ ...item, order: index }));
    setItems(updatedItems);
  };
  
  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSaveChanges = async () => {
    try {
      await Promise.all(items.map(item => LayoutItem.update(item.id, item)));
      toast({
        title: "Success",
        description: "Sidebar layout saved successfully.",
      });
    } catch (error) {
      console.error("Error saving layout changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-center p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">You do not have permission to view this page.</p>
            <Button asChild>
              <Link to={createPageUrl("Index")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Layout Manager</h1>
            <p className="text-slate-600">Drag to reorder, edit labels, and toggle visibility.</p>
          </div>
          <Button onClick={handleSaveChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="layout-items">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="bg-white hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex items-center gap-4">
                            <GripVertical className="w-5 h-5 text-slate-400 cursor-grab" />
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Input 
                                placeholder="Label"
                                value={item.label}
                                onChange={(e) => handleItemChange(item.id, 'label', e.target.value)}
                              />
                              <Input
                                placeholder="Icon Name"
                                value={item.icon}
                                onChange={(e) => handleItemChange(item.id, 'icon', e.target.value)}
                              />
                              <div className="flex items-center justify-between gap-4 p-2 border rounded-md">
                                <span className="text-sm text-slate-600">Visible</span>
                                <Switch
                                  checked={item.isVisible}
                                  onCheckedChange={(checked) => handleItemChange(item.id, 'isVisible', checked)}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
