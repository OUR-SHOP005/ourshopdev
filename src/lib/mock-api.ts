import type { IClient } from "@/lib/types"

// Mock data store
const clients: IClient[] = [
  {
    _id: "1",
    name: "John Doe",
    companyName: "Tech Solutions Inc",
    email: "john@techsolutions.com",
    phone: "+1-555-0123",
    address: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94105",
    },
    pointOfContact: {
      name: "Jane Smith",
      role: "Project Manager",
      phone: "+1-555-0124",
      email: "jane@techsolutions.com",
    },
    website: {
      url: "https://techsolutions.com",
      stack: ["React", "Node.js"],
      status: "live",
      domainProvider: "GoDaddy",
      hostingProvider: "Vercel",
    },
    services: ["development", "SEO"],
    social: [{ platform: "LinkedIn", url: "https://linkedin.com/company/techsolutions" }],
    billingPlan: {
      model: "monthly",
      amount: 5000,
      currency: "USD",
    },
    status: "active",
    tags: ["enterprise", "tech"],
    notes: "Great client, always pays on time",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "2",
    name: "Sarah Wilson",
    companyName: "Creative Agency",
    email: "sarah@creativeagency.com",
    phone: "+1-555-0125",
    address: {
      street: "456 Design Ave",
      city: "New York",
      state: "NY",
      country: "USA",
      postalCode: "10001",
    },
    website: {
      url: "https://creativeagency.com",
      stack: ["WordPress"],
      status: "maintenance",
    },
    services: ["design", "development"],
    status: "lead",
    tags: ["design", "small-business"],
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
]

export const mockApi = {
  // Get all clients
  getClients: async (): Promise<IClient[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
    return [...clients]
  },

  // Create new client
  createClient: async (clientData: Omit<IClient, "_id" | "createdAt" | "updatedAt">): Promise<IClient> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newClient: IClient = {
      ...clientData,
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    clients.push(newClient)
    return newClient
  },

  // Update client
  updateClient: async (id: string, clientData: Partial<IClient>): Promise<IClient> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = clients.findIndex((c) => c._id === id)
    if (index === -1) throw new Error("Client not found")

    clients[index] = {
      ...clients[index],
      ...clientData,
      updatedAt: new Date(),
    }
    return clients[index]
  },

  // Delete client
  deleteClient: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = clients.findIndex((c) => c._id === id)
    if (index === -1) throw new Error("Client not found")
    clients.splice(index, 1)
  },

  // Get client by ID
  getClient: async (id: string): Promise<IClient | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return clients.find((c) => c._id === id) || null
  },
}
