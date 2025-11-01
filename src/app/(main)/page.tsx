import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DecorativeHero } from '@/components/ui/decorative';
import { MoveRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const SVGText = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col ml-2">
      <span className="text-blue-600 dark:text-blue-400">{text}</span>
      <div className="w-full max-w-[800px] h-8 overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 170 800 400"><path d="M2.8673670291900635,215.4121856689453C6.302253603935242,212.12664286295572,16.457570433616638,196.74432881673178,23.476686477661133,195.6989288330078C30.495802521705627,194.65352884928384,36.02148977915446,208.69175720214844,44.98206329345703,209.13978576660156C53.942636807759605,209.5878143310547,66.03941090901692,198.38710021972656,77.24012756347656,198.38710021972656C88.4408442179362,198.38710021972656,98.8948465983073,209.43847147623697,112.18636322021484,209.13978576660156C125.47787984212239,208.84110005696616,141.30822372436523,196.29630025227866,156.98922729492188,196.59498596191406C172.67023086547852,196.89367167154947,191.33809407552084,210.18518575032553,206.2723846435547,210.93190002441406C221.20667521158853,211.6786142985026,233.00476837158203,201.37395731608072,246.594970703125,201.0752716064453C260.18517303466797,200.7765858968099,275.1194559733073,210.0358428955078,287.8135986328125,209.13978576660156C300.5077412923177,208.2437286376953,311.8577931722005,195.99761454264322,322.75982666015625,195.6989288330078C333.661860148112,195.4002431233724,340.5316518147786,207.49701436360678,353.2257995605469,207.34767150878906C365.9199473063151,207.19832865397134,381.60093688964844,195.4002431233724,398.9247131347656,194.80287170410156C416.2484893798828,194.20550028483072,438.35125223795575,203.61410013834634,457.16845703125,203.76344299316406C475.98566182454425,203.91278584798178,496.29628499348956,195.6989288330078,511.82794189453125,195.6989288330078C527.3595987955729,195.6989288330078,534.976084391276,203.76344299316406,550.3583984375,203.76344299316406C565.740712483724,203.76344299316406,585.6033020019531,196.29630025227866,604.121826171875,195.6989288330078C622.6403503417969,195.10155741373697,646.3859049479166,202.12067159016928,661.4695434570312,200.17921447753906C676.5531819661459,198.23775736490884,683.8709716796875,184.9462432861328,694.6236572265625,184.05018615722656C705.3763427734375,183.1541290283203,715.0836283365885,195.2509002685547,725.9856567382812,194.80287170410156C736.887685139974,194.35484313964844,748.8351135253906,182.25807189941406,760.0358276367188,181.3620147705078C771.2365417480469,180.46595764160156,787.6642557779948,188.0824432373047,793.18994140625,189.42652893066406" fill="none" strokeWidth="18" stroke="url(&quot;#SvgjsLinearGradient1002&quot;)" strokeLinecap="round" transform="matrix(1,0,0,1,0,0)"></path><defs><linearGradient id="SvgjsLinearGradient1002"><stop stopColor="hsl(37, 99%, 67%)" offset="0"></stop><stop stopColor="hsl(316, 73%, 52%)" offset="1"></stop></linearGradient></defs></svg>
      </div>
    </div>
  );
};

const MainPage = () => {
  return (
    <main className="flex-1">
      
      {/* Hero Section */}
      <DecorativeHero pattern="grid" className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-6 flex flex-col items-center max-w-4xl">
              <h1 className="flex text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-center">
                Welcome to Quaslation
              </h1>
              <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground">
                Discover the <del>best</del> fan translations of <strong>Asian</strong> web novels. Immerse yourself in captivating stories from
                across Asia.
              </p>
              <Button size="lg" className="bg-gradient-to-r-indigo-violet text-primary px-8 py-3" asChild>
                <Link href="/novels">
                  Browse Novels <MoveRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DecorativeHero>

      {/* Features Section */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient-indigo-violet mb-4">Why Choose Quaslation?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the difference with our carefully curated translations and active community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-gradient-indigo-violet">High Quality Translations</CardTitle>
                <CardDescription>
                  Meticulously translated and edited by passionate fans who love the source material.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every chapter goes through multiple rounds of editing to ensure accuracy and readability.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-gradient-indigo-violet">Regular Updates</CardTitle>
                <CardDescription>
                  New chapters released frequently to keep you up to date with your favorite stories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our dedicated translators work consistently to bring you the latest content as soon as possible.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-gradient-indigo-violet">Active Community</CardTitle>
                <CardDescription>
                  Join fellow fans in discussions, theories, and sharing your love for these stories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Engage with other readers through comments and our Discord community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 flex flex-col items-center">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-5xl flex">Latest <span className="text-gradient-indigo-violet ml-2">Releases</span></h2>
              <p className="max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stay up to date with our most recent translations. New chapters added regularly!
              </p>
            </div>
            <Button variant="primary" asChild><Link href={"/home"}>View Latest Releases <MoveRightIcon className='w-4 h-4 ml-2' /></Link></Button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default MainPage