import { useDiagnosisStore } from "@/hooks";
import { Button, CaixaDeUpload, Dropdown } from "@/components";
import mulherDiagnostico from '../../assets/imgs/mulher_raiox2.png';
import { client } from "@/client";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

interface DiagnosticoStep1Props {
  setReq: (arg: any) => void;
}

export const DiagnosticoStep1: FC<PropsWithChildren<DiagnosticoStep1Props>> = ({ setReq }) => {
  const [sexo, setSexo] = useState<{ label: string; value: string } | undefined>(undefined);
  const [imagem, setImagem] = useState<File[]>([]);

  const updateCurrentStep = useDiagnosisStore((state) => state.setDiagnosticoStep);
  const { toast } = useToast();
  const examType = useDiagnosisStore((state) => state.diagnostico);
  const setExamType = useDiagnosisStore((state) => state.setDiagnostico);
  const isIdadeOssea = examType === 'idade_ossea';

  useEffect(() => {
    const storedType = localStorage.getItem('diagnosisType');
    if (storedType) {
      setExamType(storedType);
    }
  }, [setExamType]);

  // Usar o primeiro arquivo do array de imagens (upload)
  const file = imagem.length > 0 ? imagem[0] : undefined;

  const handleClick = async () => {
    if (!file) {
      toast.error("Por favor, faça upload da imagem.");
      return;
    }

    if (isIdadeOssea && !sexo) {
      toast.error('Selecione o sexo referente à idade óssea');
      return;
    }

    try {
      const loadingToastId = toast.loading('Analisando exame');

      const resBody = await client.sendImage({
        path: '/diagnose',
        file,
        exam_type: examType,
        patient_sex: sexo?.value,
        selected_diseases_json: ['pneumonia', 'derrame_pleural'] // exemplo de doenças selecionadas
      });

      toast.update.success(loadingToastId, 'Análise concluída');
      setReq({ file, ...resBody });
      updateCurrentStep(2);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        const statusText = axiosError.response?.statusText || '';
        const statusCode = axiosError.response?.status || '';
        toast.error(`${statusCode} : ${statusText}`);
      } else if (error instanceof Error) {
        toast.error('Erro inesperado: ' + error.message);
      } else {
        toast.error('Erro desconhecido');
      }
    }
  };

  return (
    <div className="h-full">
      <div className="w-full h-full flex flex-col justify-center items-center gap-7">
        <div
          className="bg-linear-to-r from-gradient-brightblue to-gradient-darkblue flex items-start rounded-2xl
          2xl:w-[1475px] xl:w-[980px] xl:min-h-[444px] lg:w-[800px]
          2xl:p-15 2xl:px-16 xl:p-10 p-10 px-12"
        >
          <div className="flex flex-col relative">
            {isIdadeOssea && (
              <Dropdown
                buttonClassName={`hover:cursor-pointer bg-white rounded-sm ${
                  sexo ? "text-black" : "text-gray-500"
                }
                2xl:w-[280px] 2xl:py-1 2xl:p-3 2xl:mb-6 2xl:text-sm
                xl:w-[260px] xl:py-1 xl:p-2
                w-[200px] p-2 py-1 text-xs mb-4`}
                itemClassName="2xl:w-[268px] xl:w-[248px] w-[190px]"
                placeholderText="Selecione o sexo do paciente"
                opcaoSelecionada={sexo}
                setOpcaoSelecionada={setSexo}
                options={[
                  { label: "Masculino", value: "masculino" },
                  { label: "Feminino", value: "feminino" },
                ]}
              />
            )}
            <CaixaDeUpload
              imagem={imagem}
              setImagem={setImagem}
              serverResponseStatus='unrequested'
            />
            <p className="text-white pt-3 text-xs">Somente PNG e JPG (4mb max)</p>
            <img
              src={mulherDiagnostico}
              alt="Mulher diagnóstico"
              className={`z-0 absolute 
                2xl:ml-[110%] xl:ml-[125%] ml-[130%] 
                ${isIdadeOssea
                  ? '2xl:my-[-6.9%] xl:my-[0.55%] my-[1%]'
                  : '2xl:h-[120%] 2xl:my-[-6.2%] xl:my-[-0.6%] my-[-9.5%] xl:h-auto h-[130%]'}`}
            />
          </div>
        </div>
        <Button
          disabled={!imagem.length}
          className={`${!imagem.length ? 'bg-gray-500 hover:bg-gray-500 hover:cursor-default' : ''}`}
          onClick={handleClick}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
};
