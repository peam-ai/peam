import { HomeLayout } from '@/components/geistdocs/home-layout';

const Layout = ({ children }: LayoutProps<'/'>) => (
  <HomeLayout>
    <div>{children}</div>
  </HomeLayout>
);

export default Layout;
