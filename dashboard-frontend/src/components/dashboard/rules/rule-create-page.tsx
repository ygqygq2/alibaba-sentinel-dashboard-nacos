/**
 * 通用规则创建页面组件
 * 提取所有规则创建页面的通用逻辑
 */

import { Box, Stack } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useOpenedInNewTab } from '@/hooks/use-opened-in-new-tab';
import { useUser } from '@/hooks/use-user';
import { paths } from '@/paths';

export interface RuleCreatePageProps<TRule> {
  /** 规则类型名称（用于页面标题） */
  ruleTypeName: string;
  /** 规则表单组件 */
  FormComponent: React.ComponentType<{
    app: string;
    initialData?: Partial<TRule>;
    onSubmit: (data: Omit<TRule, 'id'>) => Promise<void>;
    onCancel?: () => void;
    isSubmitting?: boolean;
    backPath: string;
  }>;
  /** 创建规则的 mutation hook */
  useCreateMutation: (app?: string) => {
    mutateAsync: (data: Omit<TRule, 'id'>) => Promise<TRule>;
    isPending: boolean;
  };
  /** 获取返回路径的函数 */
  getBackPath: (app: string) => string;
}

/**
 * 通用规则创建页面
 * 处理新标签页打开、资源名称预填充、自动关闭等通用逻辑
 */
export function RuleCreatePage<TRule extends { resource: string }>({
  ruleTypeName,
  FormComponent,
  useCreateMutation,
  getBackPath,
}: RuleCreatePageProps<TRule>): React.JSX.Element {
  const { app } = useParams<{ app: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const createRule = useCreateMutation(app ?? '');
  const { isOpenedInNewTab, data, closeTab } = useOpenedInNewTab();
  const { user, isLoading } = useUser();

  // 页面加载时立即检查登录状态
  React.useEffect(() => {
    if (!isLoading && !user) {
      // 未登录，保存当前路径后跳转到登录页
      const returnUrl = window.location.pathname + window.location.search;
      navigate(`${paths.auth.custom.signIn}?returnUrl=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [user, isLoading, navigate]);

  // 从 sessionStorage 或 location.state 获取预填充的资源名称
  const initialResource = React.useMemo(() => {
    return (data?.resource as string) || location.state?.resource || '';
  }, [data, location.state]);

  const handleSubmit = async (ruleData: Omit<TRule, 'id'>) => {
    await createRule.mutateAsync(ruleData);

    if (isOpenedInNewTab) {
      // 如果是在新标签页打开的，创建成功后自动关闭标签页
      closeTab();
    } else {
      // 否则跳转回列表页
      navigate(getBackPath(app!));
    }
  };

  const handleCancel = () => {
    // 取消操作也需要关闭新标签页或返回
    closeTab();
  };

  // 正在检查登录状态，显示加载中
  if (isLoading) {
    return <></>;
  }

  // 未登录会在 useEffect 中跳转，这里返回空避免闪烁
  if (!user) {
    return <></>;
  }

  if (!app) {
    return <Box p={6}>应用名称不能为空</Box>;
  }

  return (
    <>
      <Helmet>
        <title>
          新增{ruleTypeName} - {app} | Sentinel Dashboard
        </title>
      </Helmet>
      <Box p={6}>
        <Stack gap={6}>
          <FormComponent
            app={app}
            initialData={initialResource ? ({ resource: initialResource } as Partial<TRule>) : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createRule.isPending}
            backPath={getBackPath(app)}
          />
        </Stack>
      </Box>
    </>
  );
}
