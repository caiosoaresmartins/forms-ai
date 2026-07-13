export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold mb-6">Termos de Serviço e Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: 13 de Julho de 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">1. Natureza do Serviço B2B</h2>
          <p className="mb-3">
            A <strong>Forms AI</strong> fornece uma infraestrutura tecnológica ("Software as a Service") destinada a clientes corporativos (doravante "Contratante"). 
            Nossa plataforma utiliza inteligência artificial para ler e analisar documentos enviados pelo Contratante.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">2. Responsabilidade sobre Dados Pessoais (LGPD)</h2>
          <p className="mb-3">
            O Contratante reconhece que atua como <strong>Controlador</strong> dos dados pessoais submetidos à plataforma Forms AI, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
          <p className="mb-3">
            A Forms AI atua estritamente como <strong>Operadora</strong>, processando os dados apenas com a finalidade de fornecer a extração e leitura de documentos via IA, conforme as instruções implícitas no uso do sistema.
          </p>
          <ul className="list-disc pl-6 mb-3">
            <li>O Contratante garante que possui a base legal adequada (ex: consentimento ou legítimo interesse) para coletar e processar os documentos de seus clientes finais.</li>
            <li>A Forms AI isenta-se de qualquer responsabilidade por dados pessoais inseridos sem o devido consentimento legal pelo Contratante.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">3. Uso da Inteligência Artificial</h2>
          <p className="mb-3">
            O sistema Forms AI utiliza modelos avançados de IA para transcrição e análise. O Contratante está ciente de que, embora a precisão seja alta, a tecnologia de IA pode ocasionalmente gerar interpretações incorretas (alucinações).
          </p>
          <p className="mb-3">
            Recomenda-se a revisão humana para decisões críticas. A Forms AI não se responsabiliza por prejuízos financeiros derivados de interpretações equivocadas da IA aceitas cegamente pelo Contratante.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">4. Proteção e Retenção de Documentos</h2>
          <p className="mb-3">
            Todos os documentos enviados são armazenados em servidores seguros. O Contratante possui o direito de excluir seus dados e documentos a qualquer momento através do painel de administração.
          </p>
        </section>

        <div className="mt-10 border-t pt-6 text-center">
          <a href="/register" className="text-primary hover:underline font-semibold">
            &larr; Voltar para o Cadastro
          </a>
        </div>
      </div>
    </div>
  );
}
