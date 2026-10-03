import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Trash2,
  ShoppingBag,
  Shirt,
  Droplet,
  Zap,
  FileText,
  Watch,
} from "lucide-react-native";

const CATEGORIES = [
  { value: "clothing", label: "Clothing", icon: Shirt, color: "#8B5CF6" },
  { value: "toiletries", label: "Toiletries", icon: Droplet, color: "#06B6D4" },
  { value: "electronics", label: "Electronics", icon: Zap, color: "#F59E0B" },
  { value: "documents", label: "Documents", icon: FileText, color: "#3B82F6" },
  { value: "accessories", label: "Accessories", icon: Watch, color: "#EC4899" },
  { value: "other", label: "Other", icon: ShoppingBag, color: "#6B7280" },
];

export default function PackingListView({ tripId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "clothing",
    quantity: 1,
  });

  useEffect(() => {
    loadItems();
  }, [tripId]);

  const loadItems = async () => {
    try {
      const response = await fetch(`/api/packing-list?trip_id=${tripId}`);
      if (!response.ok) throw new Error("Failed to load items");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error loading packing list:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.name) {
      Alert.alert("Error", "Please enter an item name");
      return;
    }

    try {
      const response = await fetch("/api/packing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          item_name: newItem.name,
          category: newItem.category,
          quantity: newItem.quantity,
        }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      setNewItem({ name: "", category: "clothing", quantity: 1 });
      setShowAddForm(false);
      loadItems();
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "Could not add item");
    }
  };

  const togglePacked = async (item) => {
    try {
      const response = await fetch("/api/packing-list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          is_packed: !item.is_packed,
        }),
      });

      if (!response.ok) throw new Error("Failed to update item");
      loadItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`/api/packing-list?id=${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const getProgress = () => {
    if (items.length === 0) return 0;
    const packed = items.filter((i) => i.is_packed).length;
    return Math.round((packed / items.length) * 100);
  };

  const groupedItems = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.category === cat.value),
  })).filter((cat) => cat.items.length > 0 || showAddForm);

  return (
    <View style={{ flex: 1 }}>
      {/* Progress Bar */}
      <View
        style={{
          backgroundColor: "#1E293B",
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#fff" }}>
            Packing Progress
          </Text>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#10B981" }}>
            {getProgress()}%
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#0F172A",
            height: 12,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              backgroundColor: "#10B981",
              height: "100%",
              width: `${getProgress()}%`,
              borderRadius: 6,
            }}
          />
        </View>
        <Text style={{ color: "#94A3B8", fontSize: 13, marginTop: 8 }}>
          {items.filter((i) => i.is_packed).length} of {items.length} items
          packed
        </Text>
      </View>

      {/* Add Item Button */}
      <TouchableOpacity
        onPress={() => setShowAddForm(!showAddForm)}
        style={{
          backgroundColor: "#3B82F6",
          padding: 16,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Plus size={20} color="#fff" strokeWidth={3} />
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: 16,
            marginLeft: 8,
          }}
        >
          Add Item
        </Text>
      </TouchableOpacity>

      {/* Add Item Form */}
      {showAddForm && (
        <View
          style={{
            backgroundColor: "#1E293B",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <TextInput
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            placeholder="Item name (e.g., Passport, Sunscreen)"
            placeholderTextColor="#64748B"
            style={{
              backgroundColor: "#0F172A",
              color: "#fff",
              padding: 12,
              borderRadius: 10,
              marginBottom: 12,
              fontSize: 15,
            }}
          />

          <Text
            style={{
              color: "#94A3B8",
              fontSize: 13,
              marginBottom: 8,
              fontWeight: "600",
            }}
          >
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = newItem.category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() =>
                    setNewItem({ ...newItem, category: cat.value })
                  }
                  style={{
                    backgroundColor: isSelected ? cat.color : "#0F172A",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    marginRight: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Icon size={16} color={isSelected ? "#fff" : cat.color} />
                  <Text
                    style={{
                      color: isSelected ? "#fff" : "#94A3B8",
                      fontWeight: "700",
                      fontSize: 13,
                      marginLeft: 6,
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={addItem}
            style={{
              backgroundColor: "#10B981",
              padding: 14,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
              Add to List
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Grouped Items */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {groupedItems.map((category) => {
          const Icon = category.icon;
          return (
            <View key={category.value} style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Icon size={20} color={category.color} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    color: "#fff",
                    marginLeft: 8,
                  }}
                >
                  {category.label}
                </Text>
                <View
                  style={{
                    backgroundColor: category.color + "30",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      color: category.color,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {category.items.length}
                  </Text>
                </View>
              </View>

              {category.items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: "#1E293B",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    borderLeftWidth: 4,
                    borderLeftColor: item.is_packed
                      ? "#10B981"
                      : category.color,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => togglePacked(item)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: item.is_packed ? "#10B981" : "#0F172A",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                      borderWidth: 2,
                      borderColor: item.is_packed ? "#10B981" : "#475569",
                    }}
                  >
                    {item.is_packed && (
                      <Check size={16} color="#fff" strokeWidth={3} />
                    )}
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: item.is_packed ? "#94A3B8" : "#fff",
                        textDecorationLine: item.is_packed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {item.item_name}
                    </Text>
                    {item.quantity > 1 && (
                      <Text
                        style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}
                      >
                        Quantity: {item.quantity}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteItem(item.id)}
                    style={{
                      backgroundColor: "#EF444420",
                      padding: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        {items.length === 0 && !showAddForm && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <ShoppingBag size={48} color="#475569" />
            <Text style={{ color: "#94A3B8", fontSize: 16, marginTop: 12 }}>
              No packing items yet
            </Text>
            <Text style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>
              Tap "Add Item" to start your list
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
