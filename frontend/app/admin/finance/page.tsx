import DashboardLayout from "@/components/dashboard-layout"

export default function FinancialManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Financial Management</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-medium text-sm text-muted-foreground">Total Revenue</h3>
            <div className="mt-2 flex items-center">
              <span className="text-3xl font-bold">$12,450</span>
              <span className="ml-2 text-sm text-green-500 flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1L9 5L5 9M1 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                12.5%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. previous month</p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-medium text-sm text-muted-foreground">Pending Escrow</h3>
            <div className="mt-2 flex items-center">
              <span className="text-3xl font-bold">$3,245</span>
              <span className="ml-2 text-sm text-amber-500 flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 9L9 5L5 1M1 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                8.3%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. previous month</p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-medium text-sm text-muted-foreground">Transactions</h3>
            <div className="mt-2 flex items-center">
              <span className="text-3xl font-bold">286</span>
              <span className="ml-2 text-sm text-green-500 flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1L9 5L5 9M1 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                24.1%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. previous month</p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-medium text-sm text-muted-foreground">Refunds</h3>
            <div className="mt-2 flex items-center">
              <span className="text-3xl font-bold">$349</span>
              <span className="ml-2 text-sm text-red-500 flex items-center">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 9L9 5L5 1M1 5H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                2.3%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. previous month</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Revenue by Service Category</h3>
              <p className="text-sm text-muted-foreground">Distribution of earnings across service types</p>
            </div>
            <div className="px-6 pb-6">
              <div className="h-80 bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <p className="mt-2 text-sm text-muted-foreground">Chart visualization goes here</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Monthly Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Platform earnings over the last 12 months</p>
            </div>
            <div className="px-6 pb-6">
              <div className="h-80 bg-muted/20 rounded-md flex items-center justify-center">
                <div className="text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                  </svg>
                  <p className="mt-2 text-sm text-muted-foreground">Chart visualization goes here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
            <p className="text-sm text-muted-foreground">Monitor payment activities on the platform</p>
          </div>
          <div className="p-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Transaction ID</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Service</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">#TX9856</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">John Doe</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Web Development</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">$120.00</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Mar 28, 2025</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 hover:bg-green-200/80">
                        Completed
                      </span>
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">#TX9855</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Sarah Wilson</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Graphic Design</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">$85.50</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Mar 27, 2025</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200/80">
                        Pending
                      </span>
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                          View
                        </button>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input text-amber-500 hover:bg-amber-50 hover:text-amber-600 h-9 px-3">
                          Release
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">#TX9854</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Michael Brown</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Math Tutoring</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">$45.00</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">Mar 26, 2025</td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-100 text-red-800 hover:bg-red-200/80">
                        Refunded
                      </span>
                    </td>
                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 flex justify-end">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              View All Transactions
            </button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Escrow Management</h3>
            <p className="text-sm text-muted-foreground mb-4">Hold/release payments after service completion</p>
            <div className="rounded-md bg-amber-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">15 Pending Escrow Payments</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>Payments waiting to be released after service verification.</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              Manage Escrow
            </button>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Refund Processing</h3>
            <p className="text-sm text-muted-foreground mb-4">Handle refund requests and disputes</p>
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">5 Refund Requests</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>New refund requests require your attention.</p>
                  </div>
                </div>
              </div>
            </div>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              Process Refunds
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}