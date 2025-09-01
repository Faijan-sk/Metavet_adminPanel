/*
// ** Third Party Imports
import axios from 'axios'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Components Imports
import PrintPage from 'src/views/apps/invoice/print/PrintPage'

const InvoicePrint = ({ id }) => {
  return <PrintPage id={id} />
}

export const getStaticPaths = async () => {
  const res = await axios.get('/apps/invoice/invoices')
  const data = await res.data.allData

  const paths = data.map(item => ({
    params: { id: `${item.id}` }
  }))

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = ({ params }) => {
  return {
    props: {
      id: params?.id
    }
  }
}

InvoicePrint.getLayout = page => <BlankLayout>{page}</BlankLayout>
InvoicePrint.setConfig = () => {
  return {
    mode: 'light'
  }
}

export default InvoicePrint
*/

// ** Third Party Imports
import axios from 'axios'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Components Imports
import PrintPage from 'src/views/apps/invoice/print/PrintPage'

const InvoicePrint = ({ id }) => {
  return <PrintPage id={id} />
}

// Use SSR instead of SSG
export const getServerSideProps = async ({ params, req }) => {
  const { id } = params

  // Example: if you’re storing JWT in cookies
  const token = req.cookies?.accessToken

  // Build API headers with token if available
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  // Fetch data if needed (optional, here we just pass id)
  // const res = await axios.get(`http://localhost:8010/apps/invoice/invoices/${id}`, { headers })
  // const invoice = res.data

  return {
    props: {
      id
    }
  }
}

InvoicePrint.getLayout = page => <BlankLayout>{page}</BlankLayout>
InvoicePrint.setConfig = () => {
  return {
    mode: 'light'
  }
}

export default InvoicePrint
