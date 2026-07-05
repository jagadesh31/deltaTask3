import './App.css'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'



import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


import { ProtectedRoute } from './routes/protectedRoute.jsx'
import { PublicRoute } from './routes/publicRoute.jsx'
//client
import {Home as ClientHome} from './pages/client/home.jsx'
import MoviesInfo from './pages/client/entityInfo.jsx'
import TicketSelection from './pages/client/ticketSelection.jsx'

import {SeatSelection} from './pages/client/seatSelection.jsx'

import { RecentTransactions } from './pages/client/recentTransactions.jsx'
import {MyBookings} from './pages/client/mybookings.jsx'


//admin
import { AdminHome} from './pages/admin/home.jsx'
import { Movies } from './pages/admin/movies.jsx'

import { AdminDashboard } from './pages/admin/dashboard.jsx'
import { Transactions } from './pages/admin/transactions.jsx'


//distributor
import { DistributorDashboard } from './pages/distributor/dashboard.jsx';
import { DistributorHome } from './pages/distributor/home.jsx';

//exhibitor
import { ExhibitorDashboard } from './pages/exhibitor/dashboard.jsx';
import { ExhibitorTheaters } from './pages/exhibitor/theaters.jsx';


//shared
import {Unauthorized} from './pages/shared/unauthorized.jsx'
import { ChangePassword } from './pages/shared/changePassword.jsx'
import { ForgotPassword,ResetPassword } from './pages/shared/forgotPassword.jsx'
import { Login, Signup } from './pages/shared/register.jsx'
import { Profile } from './pages/shared/profile.jsx'
import PageNotFound from './pages/shared/pageNotFound.jsx'
import {PaymentRedirecting} from './pages/shared/paymentRedirecting.jsx'
import { ShowsInfo } from './pages/shared/showsInfo.jsx'
import { Shows } from './pages/shared/shows.jsx';
import { UnifiedHome } from './pages/shared/UnifiedHome.jsx';
import { UnifiedDashboard } from './pages/shared/UnifiedDashboard.jsx';
import { Settlements } from './pages/shared/settlements.jsx';




let router = createBrowserRouter([
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/forgotPassword',
    element: <ForgotPassword />
  },
  {
    path: '/resetPassword/:email',
    element: <ResetPassword />
  },
  {
    path: '/',
    element: <PublicRoute/>,
    children: [
      {
        index: true,
        element: <UnifiedHome />,
      },
      {
        path: ':entityType/:_id',
        element: <MoviesInfo />
      },
    ]
  },
  {
    path: '/',
    element: <ProtectedRoute allowedRoles={['admin', 'ADMIN', 'client', 'CLIENT', 'distributor', 'DISTRIBUTOR', 'exhibitor', 'EXHIBITOR']} />,
    children: [
      {
        path: 'home',
        element: <UnifiedHome />
      },
      {
        path: 'dashboard',
        element: <UnifiedDashboard />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'changePassword',
        element: <ChangePassword />

      },
      {
        path: 'show/:entityType/:showId',
        element: <ShowsInfo/>
      },
      {
        path: 'shows/:entityType/:entityId',
        element: <Shows />
      },
      {
        path: 'transactions',
        element: <Transactions />
      },
      {
        path: 'settlements',
        element: <Settlements />
      },
      {
        path: 'movies',
        element: <Movies />
      },
      {
        path: 'theaters',
        element: <ExhibitorTheaters />
      },
      {
        path: ':entityType/:_id/:type',
        element: <TicketSelection />
      },
      {
        path: ':entityType/:_id/:type/:showId',
        element: <SeatSelection />
      },
      {
        path: 'myBookings',
        element: <MyBookings />
      },
      {
        path: 'recentTransactions',
        element: <RecentTransactions />
      },
      {
        path: 'paymentRedirecting',
        element: <PaymentRedirecting />
      }
    ]
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  },
  {
    path: '*',
    element: <PageNotFound />
  }
])

function App () {

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="dark" />
    </>
  )
}

export default App
