import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Check, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Credits() {
  const [userCredit, setUserCredit] = useState(null);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const user = await base44.auth.me();
      const credits = await base44.entities.UserCredit.filter({ user_email: user.email });
      
      if (credits.length === 0) {
        const newCredit = await base44.entities.UserCredit.create({
          user_email: user.email,
          credits: 10,
          plan: "free"
        });
        setUserCredit(newCredit);
      } else {
        setUserCredit(credits[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "R$ 0",
      credits: 10,
      features: ["10 créditos/mês", "Qualidade padrão", "Suporte email"]
    },
    {
      name: "Premium",
      price: "R$ 29",
      credits: 100,
      features: ["100 créditos/mês", "Alta qualidade", "Suporte prioritário", "Sem marca d'água"]
    },
    {
      name: "Pro",
      price: "R$ 99",
      credits: 500,
      features: ["500 créditos/mês", "Qualidade máxima", "Suporte 24/7", "API access", "Recursos beta"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050506] via-[#0a0a0b] to-[#050506] text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Créditos & Planos
          </h1>
          <p className="text-gray-400 mt-2">Escolha o plano ideal para você</p>
        </div>

        <Card className="bg-[#121214] border-[#27272a] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Seus Créditos</p>
                <p className="text-4xl font-black text-yellow-400">{userCredit?.credits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Plano Atual</p>
                <p className="text-2xl font-bold capitalize">{userCredit?.plan || "free"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <Card key={idx} className={`bg-[#121214] border-[#27272a] ${plan.name === "Premium" ? "border-yellow-500" : ""}`}>
              <CardContent className="p-6">
                {plan.name === "Premium" && (
                  <div className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-black mb-4">
                  {plan.price}
                  <span className="text-sm text-gray-400 font-normal">/mês</span>
                </div>
                <div className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}