"use client";

import React, { useState, useMemo } from "react";
import {
  Store,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  Package,
  Check,
  ArrowUpRight,
  Sparkles,
  Truck,
  Plus,
  TrendingUp,
  X,
  Sliders,
  DollarSign,
  AlertCircle,
  Zap,
  Clock,
  MapPin,
  Filter
} from "lucide-react";

interface EcomChannel {
  id: string;
  name: string;
  type: string;
  platformType: "ecommerce" | "quickcommerce";
  isConnected: boolean;
  orderCount: number;
  salesVolume: number;
  logo: string;
  color: string;
}

interface InventorySKU {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  warehouse: string;
  syncTime: string;
}

interface EcomOrder {
  id: string;
  channel: string;
  customer: string;
  value: number;
  date: string;
  status: "Pending" | "Shipped" | "Cancelled";
  items: string;
  carrier: string;
  deliveryTime?: string; // Estimated time for q-commerce
}

export default function SellerContent() {
  // Syncing State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Connected");

  // Mock Active Channels (E-commerce + Q-commerce)
  const [channels, setChannels] = useState<EcomChannel[]>([
    // E-commerce
    { id: "shopify", name: "Shopify Store", type: "Shopify", platformType: "ecommerce", isConnected: true, orderCount: 28, salesVolume: 8420.50, logo: "S", color: "#96bf48" },
    { id: "amazon", name: "Amazon US", type: "Amazon US", platformType: "ecommerce", isConnected: true, orderCount: 45, salesVolume: 12450.00, logo: "A", color: "#ff9900" },
    { id: "woo", name: "WooCommerce App", type: "WooCommerce", platformType: "ecommerce", isConnected: false, orderCount: 0, salesVolume: 0, logo: "W", color: "#96588a" },
    { id: "ebay", name: "eBay Global", type: "eBay", platformType: "ecommerce", isConnected: false, orderCount: 0, salesVolume: 0, logo: "E", color: "#e53238" },
    { id: "flipkart", name: "Flipkart Seller", type: "Flipkart", platformType: "ecommerce", isConnected: true, orderCount: 19, salesVolume: 3890.00, logo: "F", color: "#2874f0" },
    // Q-commerce / Hyperlocal
    { id: "blinkit", name: "Blinkit Store", type: "Blinkit", platformType: "quickcommerce", isConnected: true, orderCount: 37, salesVolume: 1845.20, logo: "B", color: "#ecc100" },
    { id: "zepto", name: "Zepto Darkstore", type: "Zepto", platformType: "quickcommerce", isConnected: true, orderCount: 42, salesVolume: 2190.80, logo: "Z", color: "#4e0d7a" },
    { id: "instamart", name: "Instamart Hub", type: "Swiggy Instamart", platformType: "quickcommerce", isConnected: false, orderCount: 0, salesVolume: 0, logo: "I", color: "#fc8019" }
  ]);

  // Master Inventory
  const [inventory, setInventory] = useState<InventorySKU[]>([
    { id: "sku-1", name: "Pro ANC Wireless Earbuds", sku: "EAR-ANC-PRO-BLK", stock: 142, price: 89.99, status: "In Stock", warehouse: "NJ Main Facility", syncTime: "2 mins ago" },
    { id: "sku-2", name: "Aero Mechanical Keyboard", sku: "KEY-MECH-AERO-RGB", stock: 12, price: 129.99, status: "Low Stock", warehouse: "CA Darkstore 2", syncTime: "5 mins ago" },
    { id: "sku-3", name: "10-in-1 USB-C Hub Adapter", sku: "HUB-USBC-10IN1", stock: 0, price: 49.99, status: "Out of Stock", warehouse: "NJ Main Facility", syncTime: "10 mins ago" },
    { id: "sku-4", name: "Nomad Smartwatch v2", sku: "WTC-NOMAD-V2-GRY", stock: 85, price: 199.99, status: "In Stock", warehouse: "CA Darkstore 2", syncTime: "1 min ago" },
    { id: "sku-5", name: "Braided USB-C Cable (2m)", sku: "CBL-USBC-BRD-2M", stock: 450, price: 14.99, status: "In Stock", warehouse: "NJ Main Facility", syncTime: "Just now" }
  ]);

  // Integrated Omnichannel Orders Queue
  const [orders, setOrders] = useState<EcomOrder[]>([
    { id: "ORD-9285", channel: "zepto", customer: "Sarah Jenkins", value: 44.97, date: "5 mins ago", status: "Pending", items: "3x Braided USB-C Cable (2m)", carrier: "Zepto Rider", deliveryTime: "10 mins" },
    { id: "ORD-9284", channel: "amazon", customer: "Liam Neeson", value: 179.98, date: "15 mins ago", status: "Pending", items: "2x Pro ANC Wireless Earbuds", carrier: "FedEx Standard" },
    { id: "ORD-9283", channel: "blinkit", customer: "Michael Chen", value: 49.99, date: "24 mins ago", status: "Shipped", items: "1x 10-in-1 USB-C Hub Adapter", carrier: "Blinkit Partner", deliveryTime: "5 mins left" },
    { id: "ORD-9282", channel: "shopify", customer: "Emma Watson", value: 129.99, date: "1 hour ago", status: "Shipped", items: "1x Aero Mechanical Keyboard", carrier: "DHL Express" },
    { id: "ORD-9281", channel: "flipkart", customer: "Aarav Sharma", value: 199.99, date: "2 hours ago", status: "Pending", items: "1x Nomad Smartwatch v2", carrier: "Delhivery" },
    { id: "ORD-9280", channel: "zepto", customer: "Priya Patel", value: 14.99, date: "3 hours ago", status: "Cancelled", items: "1x Braided USB-C Cable (2m)", carrier: "Zepto Rider" }
  ]);

  // UI Tabs & Filters
  const [channelFilter, setChannelFilter] = useState<"all" | "ecommerce" | "quickcommerce">("all");
  const [orderFilter, setOrderFilter] = useState<"all" | "pending" | "shipped" | "cancelled">("all");
  const [inventorySearch, setInventorySearch] = useState("");
  const [showConfigModal, setShowConfigModal] = useState<EcomChannel | null>(null);
  const [modalStoreUrl, setModalStoreUrl] = useState("");
  const [modalApiKey, setModalApiKey] = useState("");

  // Sync Logic
  const handleSyncAll = () => {
    setIsSyncing(true);
    setSyncStatus("Syncing...");
    setTimeout(() => {
      setInventory(prev => prev.map(item => {
        if (item.id === "sku-2") {
          return { ...item, stock: 18, status: "In Stock", syncTime: "Just now" };
        }
        return { ...item, syncTime: "Just now" };
      }));
      setOrders(prev => [
        {
          id: `ORD-${Math.floor(9300 + Math.random() * 600)}`,
          channel: Math.random() > 0.5 ? "zepto" : "shopify",
          customer: "Lucas Vance",
          value: 89.99,
          date: "Just now",
          status: "Pending",
          items: "1x Pro ANC Wireless Earbuds",
          carrier: "Runner Bot",
          deliveryTime: "8 mins"
        },
        ...prev
      ]);
      setIsSyncing(false);
      setSyncStatus("Connected");
    }, 1200);
  };

  // Toggle Connection
  const handleToggleConnection = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    if (channel.isConnected) {
      setChannels(prev => prev.map(c => c.id === channelId ? { ...c, isConnected: false, orderCount: 0, salesVolume: 0 } : c));
    } else {
      setShowConfigModal(channel);
      setModalApiKey("");
      setModalStoreUrl("");
    }
  };

  const handleConfirmConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConfigModal) return;

    setChannels(prev => prev.map(c => 
      c.id === showConfigModal.id 
        ? { ...c, isConnected: true, orderCount: Math.floor(15 + Math.random() * 25), salesVolume: parseFloat((1000 + Math.random() * 4000).toFixed(2)) } 
        : c
    ));
    setShowConfigModal(null);
  };

  // Ship/Dispatch Order
  const handleShipOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Shipped" } : o));
  };

  // Computed Values
  const activeChannelCount = useMemo(() => channels.filter(c => c.isConnected).length, [channels]);
  const totalVolume = useMemo(() => channels.reduce((sum, c) => sum + c.salesVolume, 0), [channels]);
  const pendingOrdersCount = useMemo(() => orders.filter(o => o.status === "Pending").length, [orders]);
  const lowStockCount = useMemo(() => inventory.filter(i => i.status !== "In Stock").length, [inventory]);

  const filteredChannels = useMemo(() => {
    if (channelFilter === "all") return channels;
    return channels.filter(c => c.platformType === channelFilter);
  }, [channels, channelFilter]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter(o => o.status.toLowerCase() === orderFilter);
  }, [orders, orderFilter]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(i => 
      i.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
      i.sku.toLowerCase().includes(inventorySearch.toLowerCase())
    );
  }, [inventory, inventorySearch]);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Seller Platform</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Centralized OMS & IMS for all e-commerce marketplaces and hyperlocal quick-commerce darkstores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 px-3 bg-surface border border-border rounded-xl text-[10px] font-semibold text-muted-foreground flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? "bg-primary animate-pulse" : "bg-success"}`} />
            <span>Integrations Engine: {syncStatus}</span>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>Sync Stores & Stocks</span>
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales */}
        <div className="glass-card p-5 space-y-2 border border-border/50 hover:border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aggregate Sales</span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-success">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.1% omnichannel velocity</span>
            </div>
          </div>
        </div>

        {/* Connections */}
        <div className="glass-card p-5 space-y-2 border border-border/50 hover:border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Channels</span>
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{activeChannelCount} / {channels.length}</h3>
            <p className="text-[10px] text-muted-foreground mt-1">Simultaneous inventory mapping active</p>
          </div>
        </div>

        {/* Pending */}
        <div className="glass-card p-5 space-y-2 border border-border/50 hover:border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Dispatch</span>
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{pendingOrdersCount} Orders</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-warning font-semibold">
              <Zap className="w-3.5 h-3.5 animate-pulse text-warning" />
              <span>2 urgent quick-commerce orders</span>
            </div>
          </div>
        </div>

        {/* Stock Warnings */}
        <div className="glass-card p-5 space-y-2 border border-border/50 hover:border-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SKU Depletion</span>
            <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{lowStockCount} Alerts</h3>
            <p className="text-[10px] text-danger mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Restock requested by AI</span>
            </p>
          </div>
        </div>
      </div>

      {/* Master Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Synchronizer Table */}
          <div className="glass-card p-6 border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Integrated Orders Queue</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Real-time incoming orders from E-commerce and Quick-commerce darkstores.</p>
              </div>

              {/* Order Tabs */}
              <div className="flex bg-surface/50 border border-border/30 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
                {(["all", "pending", "shipped", "cancelled"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setOrderFilter(tab)}
                    className={`px-3 py-1.5 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                      orderFilter === tab 
                        ? "bg-primary text-white font-bold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Channel</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Items</th>
                    <th className="py-2.5">Value</th>
                    <th className="py-2.5">Fulfillment</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No active orders matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const channelObj = channels.find(c => c.id === order.channel);
                      const isQcom = channelObj?.platformType === "quickcommerce";
                      return (
                        <tr key={order.id} className="table-row-hover">
                          <td className="py-3 font-semibold text-foreground">{order.id}</td>
                          <td className="py-3">
                            <span 
                              className="px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 w-max"
                              style={{ backgroundColor: channelObj?.color || "#555" }}
                            >
                              {isQcom && <Zap className="w-2.5 h-2.5 animate-pulse text-white shrink-0" />}
                              <span>{channelObj?.name || order.channel}</span>
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground font-medium">{order.customer}</td>
                          <td className="py-3 text-muted-foreground truncate max-w-[160px]" title={order.items}>{order.items}</td>
                          <td className="py-3 font-semibold text-foreground">${order.value.toFixed(2)}</td>
                          <td className="py-3">
                            <div className="flex flex-col">
                              <span className={`badge w-max ${
                                order.status === "Shipped" 
                                  ? "bg-success/15 text-success" 
                                  : order.status === "Pending"
                                  ? "bg-warning/15 text-warning animate-pulse"
                                  : "bg-muted-fg/10 text-muted-foreground"
                              }`}>
                                {order.status === "Shipped" && isQcom ? "In Transit" : order.status}
                              </span>
                              {order.status === "Shipped" && order.deliveryTime && (
                                <span className="text-[9px] text-success/80 font-semibold mt-0.5 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>ETA: {order.deliveryTime}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            {order.status === "Pending" ? (
                              <button
                                onClick={() => handleShipOrder(order.id)}
                                className={`px-2.5 py-1 border rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto ${
                                  isQcom 
                                    ? "bg-warning/20 hover:bg-warning border-warning/30 text-warning hover:text-white"
                                    : "bg-primary/20 hover:bg-primary border-primary/30 text-primary hover:text-white"
                                }`}
                              >
                                <Truck className="w-3 h-3" />
                                <span>{isQcom ? "Dispatch Rider" : "Ship Order"}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center justify-end gap-1">
                                <Check className="w-3.5 h-3.5 text-success" />
                                <span>{isQcom ? "Delivering" : "Ready"} ({order.carrier})</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Master Inventory Registry */}
          <div className="glass-card p-6 border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Omnichannel Stock Registry</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Unified inventory map synced across central warehouses and local darkstores.</p>
              </div>

              {/* SKU Search */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search SKU code, name..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5">Product Name</th>
                    <th className="py-2.5">SKU Code</th>
                    <th className="py-2.5">Unit Price</th>
                    <th className="py-2.5 text-center">Available Stock</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5 text-right">Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No product SKUs match search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(item => (
                      <tr key={item.id} className="table-row-hover">
                        <td className="py-3 font-semibold text-foreground">{item.name}</td>
                        <td className="py-3 text-muted-foreground font-mono text-[10px]">{item.sku}</td>
                        <td className="py-3 font-semibold text-foreground">${item.price.toFixed(2)}</td>
                        <td className="py-3 text-center font-bold text-foreground">{item.stock} units</td>
                        <td className="py-3">
                          <span className={`badge ${
                            item.status === "In Stock" 
                              ? "bg-success/15 text-success" 
                              : item.status === "Low Stock"
                              ? "bg-warning/15 text-warning"
                              : "bg-danger/15 text-danger"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span>{item.warehouse}</span>
                        </td>
                        <td className="py-3 text-right text-[10px] text-muted-foreground/80">{item.syncTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Section (1/3 width) */}
        <div className="space-y-6">
          {/* Channel Connections Manager */}
          <div className="glass-card p-6 border border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Store Channels</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Integrations dashboard</p>
              </div>

              {/* Channel Type Filter */}
              <div className="flex bg-surface border border-border/50 p-0.5 rounded-lg text-[9px] font-bold">
                {(["all", "ecommerce", "quickcommerce"] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setChannelFilter(type)}
                    className={`px-2 py-1 rounded transition-all cursor-pointer ${
                      channelFilter === type 
                        ? "bg-primary/20 text-primary font-bold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type === "quickcommerce" ? "Q-Com" : type === "ecommerce" ? "E-Com" : "All"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {filteredChannels.map(channel => (
                <div key={channel.id} className="p-3 bg-surface/50 border border-border/40 hover:border-primary/20 rounded-xl flex items-center justify-between transition-all">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0"
                      style={{ backgroundColor: channel.color }}
                    >
                      {channel.logo}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                        <span>{channel.name}</span>
                        {channel.platformType === "quickcommerce" && (
                          <span className="text-[8px] bg-warning/20 text-warning px-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                            <Zap className="w-2 h-2 text-warning fill-warning" />
                            Q-Com
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {channel.isConnected 
                          ? `${channel.orderCount} Orders | $${channel.salesVolume.toFixed(2)} Sales`
                          : "Not Integrated"
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleConnection(channel.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold tracking-wide shrink-0 transition-all cursor-pointer ${
                      channel.isConnected
                        ? "bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/20"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20"
                    }`}
                  >
                    {channel.isConnected ? "Disconnect" : "Integrate"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Inventory Forecast & Darkstore Replenishment Warnings */}
          <div className="glass-card p-6 border border-border/50 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  AI Restock Predictor
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Omnichannel velocity forecasts.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Q-Commerce Velocity Alert */}
              <div className="p-3 bg-danger/15 border border-danger/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-danger fill-danger shrink-0" />
                    <span className="text-[10px] font-bold text-danger uppercase tracking-wider">Zepto Darkstore Velocity Alert</span>
                  </div>
                  <span className="text-[8px] bg-danger/20 text-danger px-1.5 rounded-full font-bold">URGENT</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Hourly order velocity spike detected on Zepto. <span className="font-semibold text-foreground">Braided USB-C Cable (2m)</span> will stockout in <span className="font-bold text-foreground">3 hours</span>. 
                </p>
                <div className="pt-1 flex items-center justify-between text-[9px] font-bold text-danger/80 border-t border-danger/10">
                  <span>Transfer: 50 units from NJ Hub</span>
                  <button className="underline hover:text-danger cursor-pointer">Approve Dispatch</button>
                </div>
              </div>

              {/* Low Stock Warn */}
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <span className="text-[10px] font-bold text-warning uppercase tracking-wider">E-com Stock Exhaustion</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Sales velocity predicts <span className="font-semibold text-foreground">KEY-MECH-AERO-RGB</span> (Aero Keyboard) stockout in <span className="font-bold text-foreground">4 days</span> on WooCommerce.
                </p>
                <div className="pt-1 flex items-center justify-between text-[9px] font-semibold text-warning/80">
                  <span>Probability: 92%</span>
                  <button className="underline hover:text-warning cursor-pointer">Trigger Restock</button>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Blinkit Demand Trend
                </span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  USB-C Adaptor demand is trending <span className="text-success font-semibold">+18% up</span> in CA Darkstore region. Suggest reallocation to prevent stockout in Blinkit local hubs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Setup Dialog Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-card p-6 border border-primary/20 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowConfigModal(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md"
                style={{ backgroundColor: showConfigModal.color }}
              >
                {showConfigModal.logo}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Configure {showConfigModal.name}</h3>
                <p className="text-[10px] text-muted-foreground">Unicommerce-grade secure channels API client setup.</p>
              </div>
            </div>

            <form onSubmit={handleConfirmConnection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Store Address / Darkstore API Endpoint</label>
                <input
                  type="text"
                  required
                  placeholder={showConfigModal.platformType === "quickcommerce" ? "https://api.zepto.co/partner/darkstore-v1" : "https://yourstore.myshopify.com"}
                  value={modalStoreUrl}
                  onChange={(e) => setModalStoreUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Access Token / OAuth Secret Key</label>
                <input
                  type="password"
                  required
                  placeholder="secret_xxxxxxxxxxxxxx"
                  value={modalApiKey}
                  onChange={(e) => setModalApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-surface/50 border border-border p-2.5 rounded-xl">
                <Sliders className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Inventory stock mapping and orders callback webhook will automatically configure.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(null)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Confirm Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
