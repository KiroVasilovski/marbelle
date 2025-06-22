import { Button } from '@/components/ui/button';

function Home() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Welcome to Marbelle
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Premium Natural Stone for Architects, Designers & Contractors
                </p>
                <Button size="lg">
                    Explore Our Collection
                </Button>
            </div>
        </div>
    );
}

export default Home;