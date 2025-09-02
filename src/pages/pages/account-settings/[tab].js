// ** Third Party Imports
import axios from 'axios'

// ** Demo Components Imports
import AccountSettings from 'src/views/pages/account-settings/AccountSettings'

const AccountSettingsTab = ({ tab, apiPricingPlanData }) => {
  return <AccountSettings tab={tab} apiPricingPlanData={apiPricingPlanData} />
}

export const getStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'account' } },
      { params: { tab: 'security' } },
      { params: { tab: 'billing' } },
      { params: { tab: 'notifications' } },
      { params: { tab: 'connections' } }
    ],
    fallback: false
  }
}

export const getStaticProps = async ({ params }) => {
  // const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pages/pricing`)
  // const data = res.data
  const data = {} // fallback

  return {
    props: {
      tab: params?.tab || null,
      apiPricingPlanData: data.pricingPlans || null  // <-- replace undefined with null
    }
  }
}

export default AccountSettingsTab
