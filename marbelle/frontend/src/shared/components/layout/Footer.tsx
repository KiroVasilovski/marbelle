import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { DrawerTrigger } from '../shadcn/drawer';
import ShippingLanguageDialog from './ShippingLanguageDrawer';

function Footer() {
    const { t, i18n } = useTranslation();
    const [shippingLocation, setShippingLocation] = useState('de');

    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Marbelle</h3>
                        <p className="text-gray-400">{t('footer.description')}</p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">{t('footer.products.title')}</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link to="/products" className="hover:text-white">
                                    {t('footer.products.marble')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="hover:text-white">
                                    {t('footer.products.tiles')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="hover:text-white">
                                    {t('footer.products.mosaics')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">{t('footer.company.title')}</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link to="/about" className="hover:text-white">
                                    {t('footer.company.about')}
                                </Link>
                            </li>
                            <li>
                                <a href="/contact" className="hover:text-white">
                                    {t('footer.company.contact')}
                                </a>
                            </li>
                            <li>
                                <a href="/careers" className="hover:text-white">
                                    {t('footer.company.career')}
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4">{t('footer.support.title')}</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <a href="/help" className="hover:text-white">
                                    {t('footer.support.help')}
                                </a>
                            </li>
                            <li>
                                <a href="/shipping" className="hover:text-white">
                                    {t('footer.support.shipping')}
                                </a>
                            </li>
                            <li>
                                <a href="/returns" className="hover:text-white">
                                    {t('footer.support.returns')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center text-gray-400">
                    <p>{t('footer.copyright')}</p>
                    <ShippingLanguageDialog
                        shippingLocation={shippingLocation}
                        onShippingLocationChange={setShippingLocation}
                    >
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{t('footer.shippingTo').toUpperCase()}</span>
                            <DrawerTrigger asChild>
                                <button className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer">
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {i18n.language.toUpperCase()} / {shippingLocation.toUpperCase()}
                                    </span>
                                </button>
                            </DrawerTrigger>
                        </div>
                    </ShippingLanguageDialog>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
